import { Fixture, Team } from "@/types/game";
import { LiveFixtureState, LiveRoundState, MatchEvent } from "@/types/liveMatch";
import { MatchEventFeedService } from "@/services/simulation/MatchEventFeedService";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type CreateInitialStateParams = {
  fixtures: Fixture[];
  teamsById: Record<string, Team>;
  userTeamId: string;
  quarter: number;
  totalQuarterSeconds: number;
};

export class LiveRoundSimulationService {
  constructor(private eventService = new MatchEventFeedService()) {}

  createInitialState(params: CreateInitialStateParams): LiveRoundState {
    const liveFixtures: LiveFixtureState[] = params.fixtures.map((fixture) => ({
      id: fixture.id,
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.awayTeamId,
      homeTeamName: params.teamsById[fixture.homeTeamId]?.shortName ?? fixture.homeTeamId,
      awayTeamName: params.teamsById[fixture.awayTeamId]?.shortName ?? fixture.awayTeamId,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      isUserMatch: fixture.homeTeamId === params.userTeamId || fixture.awayTeamId === params.userTeamId,
      status: "live",
    }));

    return {
      fixtures: liveFixtures,
      progress: {
        quarter: params.quarter,
        elapsedSeconds: 0,
        totalSeconds: params.totalQuarterSeconds,
        progressPercent: 0,
      },
      events: [],
      isFinished: false,
    };
  }

  tickRound(params: { state: LiveRoundState; simulatedSecondsPerTick: number; random: () => number }): LiveRoundState {
    const nextElapsed = clamp(
      params.state.progress.elapsedSeconds + params.simulatedSecondsPerTick,
      0,
      params.state.progress.totalSeconds,
    );

    const progressPercent = (nextElapsed / params.state.progress.totalSeconds) * 100;

    const contextualEvents: MatchEvent[] = [];
    if (nextElapsed === Math.floor(params.state.progress.totalSeconds / 2)) {
      const focusFixture = params.state.fixtures.find((fixture) => fixture.isUserMatch);
      if (focusFixture) {
        contextualEvents.push(this.eventService.buildInfoEvent({ fixtureId: focusFixture.id, second: nextElapsed, text: "Quarter halfway point" }));
      }
    }

    if (nextElapsed === params.state.progress.totalSeconds - 30) {
      const focusFixture = params.state.fixtures.find((fixture) => fixture.isUserMatch);
      if (focusFixture) {
        contextualEvents.push(this.eventService.buildInfoEvent({ fixtureId: focusFixture.id, second: nextElapsed, text: "Final minute of the quarter" }));
      }
    }

    const { fixtures, newEvents } = params.state.fixtures.reduce(
      (acc, fixture) => {
        const evolveChance = params.random();
        let updatedFixture = fixture;

        if (evolveChance < 0.32) {
          const scoringForHome = params.random() >= 0.5;
          const scoringTeamId = scoringForHome ? fixture.homeTeamId : fixture.awayTeamId;
          const scoreEvent = this.eventService.buildScoringEvent({
            fixtureId: fixture.id,
            second: nextElapsed,
            teamId: scoringTeamId,
            isHomeTeam: scoringForHome,
            random: params.random,
          });

          updatedFixture = {
            ...updatedFixture,
            homeScore: updatedFixture.homeScore + (scoreEvent.scoreImpact?.homeDelta ?? 0),
            awayScore: updatedFixture.awayScore + (scoreEvent.scoreImpact?.awayDelta ?? 0),
          };

          if (fixture.isUserMatch) acc.newEvents.push(scoreEvent);
        } else if (evolveChance < 0.56) {
          const teamId = params.random() >= 0.5 ? fixture.homeTeamId : fixture.awayTeamId;
          const nonScoringEvent = this.eventService.buildNonScoringEvent({
            fixtureId: fixture.id,
            second: nextElapsed,
            teamId,
            random: params.random,
          });
          if (fixture.isUserMatch) acc.newEvents.push(nonScoringEvent);
        }

        acc.fixtures.push(updatedFixture);
        return acc;
      },
      { fixtures: [] as LiveFixtureState[], newEvents: [] as MatchEvent[] },
    );

    const isFinished = nextElapsed >= params.state.progress.totalSeconds;

    const finalEvents = [...contextualEvents, ...newEvents];

    const completedEvents = isFinished
      ? [
          ...finalEvents,
          this.eventService.buildInfoEvent({
            fixtureId: params.state.fixtures.find((fixture) => fixture.isUserMatch)?.id ?? params.state.fixtures[0]?.id ?? "main-fixture",
            second: nextElapsed,
            text: "Quarter ending",
          }),
        ]
      : finalEvents;

    return {
      fixtures: fixtures.map((fixture) => ({
        ...fixture,
        status: isFinished ? "halftime" : "live",
      })),
      progress: {
        ...params.state.progress,
        elapsedSeconds: nextElapsed,
        progressPercent,
      },
      events: [...params.state.events, ...completedEvents].slice(-40),
      isFinished,
    };
  }
}
