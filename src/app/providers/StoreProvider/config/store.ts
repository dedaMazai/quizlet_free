import {
  configureStore,
  ReducersMapObject,
} from '@reduxjs/toolkit';
import {
  Reducer,
  UnknownAction,
} from 'redux';
import * as Sentry from "@sentry/react";
import { userReducer } from '@/entities/User';
import { rtkApi } from '@/shared/api/rtkApi';
import { createReducerManager } from './reducerManager';
import {
  StateSchema,
} from './StateSchema';

const sentryReduxEnhancer = Sentry.createReduxEnhancer({});

export function createReduxStore(initialState?: StateSchema, asyncReducers?: ReducersMapObject<StateSchema>) {
  const rootReducers: ReducersMapObject<StateSchema> = {
    ...asyncReducers,
    user: userReducer,
    [rtkApi.reducerPath]: rtkApi.reducer,
  };

  const reducerManager = createReducerManager(rootReducers);

  const store = configureStore({
    reducer: reducerManager.reduce as Reducer<StateSchema, UnknownAction, Partial<StateSchema>>,
    devTools: __IS_DEV__,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(rtkApi.middleware),
    enhancers: (getDefaultEnhancers) => {
      return getDefaultEnhancers().concat(sentryReduxEnhancer);
    },
  });

  // @ts-ignore — dynamic property not in store type, used by async reducers
  store.reducerManager = reducerManager;

  return store;
}

export type AppDispatch = ReturnType<typeof createReduxStore>['dispatch'];
