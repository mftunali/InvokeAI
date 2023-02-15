import { Flex, Link, Text } from '@chakra-ui/react';

import { FaGithub, FaDiscord, FaBug, FaKeyboard, FaCube } from 'react-icons/fa';

import InvokeAILogo from 'assets/images/logo.png';
import IAIIconButton from 'common/components/IAIIconButton';

import HotkeysModal from './HotkeysModal/HotkeysModal';

import SettingsModal from './SettingsModal/SettingsModal';
import StatusIndicator from './StatusIndicator';
import ThemeChanger from './ThemeChanger';
import ModelSelect from './ModelSelect';
import ModelManagerModal from './ModelManager/ModelManagerModal';

import LanguagePicker from './LanguagePicker';

import { useTranslation } from 'react-i18next';
import {MdLogout, MdSettings} from 'react-icons/md';
import ModelSelectUpily from "./ModelSelectUpily";
import {useAppDispatch, useAppSelector} from 'app/storeHooks';
import type { RootState } from 'app/store';
import {createSelector} from "@reduxjs/toolkit";
import {systemSelector} from "../store/systemSelectors";
import _ from "lodash";
import {setIsLoggedIn} from "../store/systemSlice";

const selector = createSelector(
  [systemSelector],
  (system) => {
    const { isLoggedIn, username } = system;

    return { isLoggedIn, username };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);

/**
 * Header, includes color mode toggle, settings button, status message.
 */
const SiteHeader = () => {
  const { t } = useTranslation();
  const appVersion = useAppSelector(
    (state: RootState) => state.system.app_version
  );


  const dispatch = useAppDispatch();
  const { isLoggedIn, username } = useAppSelector(selector);

  function handleLogout() {
    dispatch(setIsLoggedIn(false))
  }

  return (
    <div className="site-header">
      <div className="site-header-left-side">
        <img src={InvokeAILogo} alt="invoke-ai-logo" />
        <h1>
          Upily<strong>AI</strong>
        </h1>
      </div>

      <div className="site-header-right-side">
        <StatusIndicator />

        <ModelSelectUpily />
        {/*<ModelSelect />*/}

        <ModelManagerModal>
          <IAIIconButton
            aria-label={t('modelmanager:modelManager')}
            tooltip={t('modelmanager:modelManager')}
            size={'sm'}
            variant="link"
            data-variant="link"
            fontSize={20}
            icon={<FaCube />}
          />
        </ModelManagerModal>

        <HotkeysModal>
          <IAIIconButton
            aria-label={t('common:hotkeysLabel')}
            tooltip={t('common:hotkeysLabel')}
            size={'sm'}
            variant="link"
            data-variant="link"
            fontSize={20}
            icon={<FaKeyboard />}
          />
        </HotkeysModal>

        <ThemeChanger />

        <LanguagePicker />

        <SettingsModal>
          <IAIIconButton
            aria-label={t('common:settingsLabel')}
            tooltip={t('common:settingsLabel')}
            variant="link"
            data-variant="link"
            fontSize={22}
            size={'sm'}
            icon={<MdSettings />}
          />
        </SettingsModal>

        {isLoggedIn && (
          <>
          {username}
          <IAIIconButton
            aria-label={t('common:logout')}
            tooltip={t('common:logout')}
            variant="link"
            data-variant="link"
            fontSize={22}
            size={'sm'}
            icon={<MdLogout />}
            onClick={() => {handleLogout()}}
          />
          </>
        )}

      </div>
    </div>
  );
};

export default SiteHeader;
