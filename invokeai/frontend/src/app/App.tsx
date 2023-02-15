import ProgressBar from 'features/system/components/ProgressBar';
import SiteHeader from 'features/system/components/SiteHeader';
import Console from 'features/system/components/Console';
import { keepGUIAlive } from './utils';
import InvokeTabs from 'features/tabs/components/InvokeTabs';
import ImageUploader from 'common/components/ImageUploader';

import useToastWatcher from 'features/system/hooks/useToastWatcher';

import FloatingOptionsPanelButtons from 'features/tabs/components/FloatingOptionsPanelButtons';
import FloatingGalleryButton from 'features/tabs/components/FloatingGalleryButton';
import {createSelector} from "@reduxjs/toolkit";
import {systemSelector} from "../features/system/store/systemSelectors";
import _ from "lodash";
import {useAppDispatch, useAppSelector} from "./storeHooks";
import LoginForm from "../features/login/LoginForm";
import {setIsLoggedIn} from "../features/system/store/systemSlice";

keepGUIAlive();


const selector = createSelector(
  [systemSelector],
  (system) => {
    const { isLoggedIn, loginToken } = system;

    return { isLoggedIn, loginToken };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);


const App = () => {
  useToastWatcher();

  const dispatch = useAppDispatch();
  const { isLoggedIn, loginToken } = useAppSelector(selector);

  // dispatch(setIsLoggedIn(false))

  return (
    <div className="App">
      {!isLoggedIn
      ?
      <LoginForm />
      :
      <>
        <ImageUploader>
        <ProgressBar />
        <div className="app-content">
          <SiteHeader />
          <InvokeTabs />
        </div>
        <div className="app-console">
          <Console />
        </div>
        </ImageUploader>
        <FloatingGalleryButton />
      </>}
    </div>
  );
};

export default App;
