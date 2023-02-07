import { createSelector } from '@reduxjs/toolkit';
// import IAICanvas from 'features/canvas/components/IAICanvas';
import IAICanvasResizer from 'features/canvas/components/IAICanvasResizer';
import _ from 'lodash';
import { useLayoutEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import { setDoesCanvasNeedScaling } from 'features/canvas/store/canvasSlice';
import IAICanvas from 'features/canvas/components/IAICanvas';
import IAICanvasOutpaintingControls from 'features/canvas/components/IAICanvasToolbar/IAICanvasToolbar';
import { canvasSelector } from 'features/canvas/store/canvasSelectors';
import UnifiedCanvasToolbarBeta from "./UnifiedCanvasBeta/UnifiedCanvasToolbarBeta";
import {Flex} from "@chakra-ui/react";
import UnifiedCanvasToolSettingsBeta from "./UnifiedCanvasBeta/UnifiedCanvasToolSettingsBeta";
import UnifiedCanvasProcessingButtons from "./UnifiedCanvasBeta/UnifiedCanvasToolbar/UnifiedCanvasProcessingButtons";
import {RootState} from "../../../../app/store";
import PromptInput from "../../../options/components/PromptInput/PromptInput";
import PromptInputToolbar from "../../../options/components/PromptInput/PromptInputToolbar";
import IAICanvasLayerControls from "../../../canvas/components/IAICanvasToolbar/IAICanvasLayer";

const selector = createSelector(
  [canvasSelector],
  (canvas) => {
    const { doesCanvasNeedScaling } = canvas;
    return {
      doesCanvasNeedScaling,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);

const UnifiedCanvasDisplay = () => {
  const dispatch = useAppDispatch();

  const { doesCanvasNeedScaling } = useAppSelector(selector);

  useLayoutEffect(() => {
    dispatch(setDoesCanvasNeedScaling(true));

    const resizeCallback = _.debounce(() => {
      dispatch(setDoesCanvasNeedScaling(true));
    }, 250);

    window.addEventListener('resize', resizeCallback);

    return () => window.removeEventListener('resize', resizeCallback);
  }, [dispatch]);

  const shouldShowOptionsPanel = useAppSelector(
    (state: RootState) => state.options.shouldShowOptionsPanel
  );

  return (
    <div className={'workarea-single-view'}>
      <Flex width="100%" height="100%" flexDirection={'column'} >
        <Flex flexDirection={'row'} columnGap={'1rem'} padding="1rem">
          {!shouldShowOptionsPanel && <UnifiedCanvasProcessingButtons />}
          {!shouldShowOptionsPanel && <PromptInputToolbar />}
          <UnifiedCanvasToolSettingsBeta />
        </Flex>
        <Flex flexDirection={'row'} width="100%" height="100%" columnGap={'1rem'} paddingLeft="1rem" paddingRight="1rem">
          <Flex flexDirection={'column'}>
            <Flex flexDirection={'row'} columnGap={'1rem'}>
              <IAICanvasOutpaintingControls />
            </Flex>
          </Flex>
          <Flex width="100%" height="100%" flexDirection={'column'} rowGap={'1rem'}>
            {doesCanvasNeedScaling ? <IAICanvasResizer /> : <IAICanvas />}
          </Flex>
          <IAICanvasLayerControls />
        </Flex>
      </Flex>
    </div>
  );
};

export default UnifiedCanvasDisplay;
