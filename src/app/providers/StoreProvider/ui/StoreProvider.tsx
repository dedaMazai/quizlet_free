import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { setAuthFailureHandler } from '@/shared/api/authenticatedFetch';
import { checkIsPublicPage } from '@/shared/config/router/routePath';
import { userActions } from '@/entities/User/model/slice/userSlice';
import { rtkApi } from '@/shared/api/rtkApi';
import { createReduxStore } from '../config/store';

interface StoreProviderProps {
  children?: ReactNode
}

export const store = createReduxStore();

setAuthFailureHandler(() => {
    if (checkIsPublicPage(window.location.pathname)) return;
    store.dispatch(userActions.logout());
    store.dispatch(rtkApi.util.resetApiState());
});

export const StoreProvider = (props: StoreProviderProps) => {
  const {
    children,
  } = props;

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};
