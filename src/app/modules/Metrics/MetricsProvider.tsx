import { useAuth, useConfig } from '@rhoas/app-services-ui-shared';
import { useInterpret } from '@xstate/react';
import React, { createContext, FunctionComponent } from 'react';
import { InterpreterFrom } from 'xstate';
import {
  DiskSpaceMetricsMachine,
  TopicsMetricsMachineType,
  TopicsMetricsMachine,
  TopicsMetricsModel,
  DiskSpaceMachineType,
  DiskSpaceMetricsModel,
} from './machines';
import { fetchDiskSpaceMetrics, fetchTopicsMetrics } from './MetricsApi';
import { timeIntervalsMapping } from './utils';

type MetricsContextProps = {
  kafkaId: string;
  kafkaApiPath: string;
  topicsMetricsMachineService: InterpreterFrom<TopicsMetricsMachineType>;
  diskSpaceMetricsMachineService: InterpreterFrom<DiskSpaceMachineType>;
};
export const MetricsContext = createContext<MetricsContextProps>(null!);

type MetricsProviderProps = {
  kafkaId: string;
  kafkaApiPath: string;
};

export const MetricsProvider: FunctionComponent<MetricsProviderProps> = ({
  kafkaId,
  kafkaApiPath,
  children,
}) => {
  const topicsMetricsMachineService = useTopicsMetricsMachineService(
    kafkaId,
    kafkaApiPath
  );
  const diskSpaceMetricsMachineService =
    useDiskSpaceMetricsMachineService(kafkaId);
  return (
    <MetricsContext.Provider
      value={{
        kafkaId,
        kafkaApiPath,
        diskSpaceMetricsMachineService,
        topicsMetricsMachineService,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

function useTopicsMetricsMachineService(kafkaId: string, kafkaApiPath: string) {
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};

  return useInterpret(
    TopicsMetricsMachine.withConfig({
      services: {
        api: (context) => {
          return (callback) => {
            fetchTopicsMetrics({
              kafkaId: kafkaId,
              selectedTopic: context.selectedTopic,
              timeDuration: context.timeDuration,
              timeInterval: timeIntervalsMapping[context.timeDuration],
              accessToken: auth.kas.getToken(),
              basePath: basePath,
              kafkaApiPath,
            })
              .then((results) =>
                callback(TopicsMetricsModel.events.fetchSuccess(results))
              )
              .catch((e) => {
                console.error('Failed fetching data', e);
                callback(TopicsMetricsModel.events.fetchFail());
              });
          };
        },
      },
    }),
    {
      devTools: true,
    }
  );
}
function useDiskSpaceMetricsMachineService(kafkaId: string) {
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};

  return useInterpret(
    DiskSpaceMetricsMachine.withConfig({
      services: {
        api: (context) => {
          return (callback) => {
            fetchDiskSpaceMetrics({
              kafkaId: kafkaId,
              timeDuration: context.timeDuration,
              timeInterval: timeIntervalsMapping[context.timeDuration],
              accessToken: auth.kas.getToken(),
              basePath: basePath,
            })
              .then((results) =>
                callback(
                  DiskSpaceMetricsModel.events.fetchSuccess({
                    metrics: results,
                  })
                )
              )
              .catch((e) => {
                console.error('Failed fetching data', e);
                callback(DiskSpaceMetricsModel.events.fetchFail());
              });
          };
        },
      },
    }),
    {
      devTools: true,
    }
  );
}