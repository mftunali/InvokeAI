import {ButtonGroup, Flex} from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import {
  bringForward,
  deleteSelectedImage,
  removeBackground,
  saveToUpilyGallery,
  resetCanvas,
  resetCanvasView,
  resizeAndScaleCanvas, sendBackward,
  setIsMaskEnabled,
  setLayer, setSelectedImage,
  setTool, pixImage, generateUpily,
} from 'features/canvas/store/canvasSlice';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import _ from 'lodash';
import IAIIconButton from 'common/components/IAIIconButton';
import {
  FaArrowAltCircleDown,
  FaArrowsAlt, FaBackward, FaCircleNotch,
  FaCopy,
  FaCrosshairs,
  FaDownload, FaForward,
  FaLayerGroup, FaRegArrowAltCircleUp, FaRemoveFormat,
  FaSave, FaStepBackward, FaStepForward,
  FaTrash,
  FaUpload, FaUserAltSlash, FaUserCheck,
} from 'react-icons/fa';
import IAICanvasUndoButton from './IAICanvasUndoButton';
import IAICanvasRedoButton from './IAICanvasRedoButton';
import IAICanvasSettingsButtonPopover from './IAICanvasSettingsButtonPopover';
import IAICanvasMaskOptions from './IAICanvasMaskOptions';
import { mergeAndUploadCanvas } from 'features/canvas/store/thunks/mergeAndUploadCanvas';
import { useHotkeys } from 'react-hotkeys-hook';
import { getCanvasBaseLayer } from 'features/canvas/util/konvaInstanceProvider';
import { systemSelector } from 'features/system/store/systemSelectors';
import { optionsSelector } from 'features/options/store/optionsSelectors';
import IAICanvasToolChooserOptions from './IAICanvasToolChooserOptions';
import useImageUploader from 'common/hooks/useImageUploader';
import {
  canvasSelector,
  isStagingSelector,
} from 'features/canvas/store/canvasSelectors';
import IAISelect from 'common/components/IAISelect';
import {
  CanvasLayer,
  LAYER_NAMES_DICT,
} from 'features/canvas/store/canvasTypes';
import {ChangeEvent, useCallback} from 'react';
import { useTranslation } from 'react-i18next';
import {KonvaEventObject} from "konva/lib/Node";
import {setSeed, setShouldRandomizeSeed} from "../../../options/store/optionsSlice";

export const selector = createSelector(
  [optionsSelector, systemSelector, canvasSelector, isStagingSelector],
  (options, system, canvas, isStaging) => {
    const { isProcessing, upilyModel } = system;
    const { prompt, cfgScale, steps, sampler, seed, shouldRandomizeSeed } = options;
    const { tool, shouldCropToBoundingBoxOnSave, layer, isMaskEnabled, boundingBoxCoordinates } =
      canvas;

    return {
      boundingBoxCoordinates,
      prompt,
      cfgScale,
      steps,
      sampler,
      seed,
      shouldRandomizeSeed,
      isProcessing,
      upilyModel,
      isStaging,
      isMaskEnabled,
      tool,
      layer,
      shouldCropToBoundingBoxOnSave,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);

const layerSelector = createSelector(
  [canvasSelector],
  (canvas) => {
    const {
      layerState: { objects, selectedImageIndex },
    } = canvas;
    return {
      objects, selectedImageIndex
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);


const IAICanvasOutpaintingControls = () => {
  const dispatch = useAppDispatch();
  const {
    boundingBoxCoordinates,
    prompt,
    cfgScale,
    steps,
    sampler,
    seed,
    shouldRandomizeSeed,
    isProcessing,
    upilyModel,
    isStaging,
    isMaskEnabled,
    layer,
    tool,
    shouldCropToBoundingBoxOnSave,
  } = useAppSelector(selector);
  const canvasBaseLayer = getCanvasBaseLayer();

  const {
    objects,
    selectedImageIndex,
  } = useAppSelector(layerSelector);

  const { t } = useTranslation();

  const { openUploader } = useImageUploader();

  useHotkeys(
    ['v'],
    () => {
      handleSelectMoveTool();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    []
  );

  useHotkeys(
    ['r'],
    () => {
      handleResetCanvasView();
    },
    {
      enabled: () => true,
      preventDefault: true,
    },
    [canvasBaseLayer]
  );

  useHotkeys(
    ['shift+m'],
    () => {
      handleMergeVisible();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [canvasBaseLayer, isProcessing]
  );

  useHotkeys(
    ['shift+s'],
    () => {
      handleSaveToGallery();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [canvasBaseLayer, isProcessing]
  );

  useHotkeys(
    ['meta+c', 'ctrl+c'],
    () => {
      handleCopyImageToClipboard();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [canvasBaseLayer, isProcessing]
  );

  useHotkeys(
    ['shift+d'],
    () => {
      handleDownloadAsImage();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [canvasBaseLayer, isProcessing]
  );

  const handleSelectMoveTool = () => dispatch(setTool('move'));

  const handleResetCanvasView = () => {
    const canvasBaseLayer = getCanvasBaseLayer();
    if (!canvasBaseLayer) return;
    const clientRect = canvasBaseLayer.getClientRect({
      skipTransform: true,
    });
    dispatch(
      resetCanvasView({
        contentRect: clientRect,
      })
    );
  };

  const handleResetCanvas = () => {
    dispatch(resetCanvas());
    dispatch(resizeAndScaleCanvas());
  };

  const handleMergeVisible = () => {
    if (shouldCropToBoundingBoxOnSave){
      dispatch(
        mergeAndUploadCanvas({
          cropVisible: shouldCropToBoundingBoxOnSave ? false : true,
          cropToBoundingBox: shouldCropToBoundingBoxOnSave,
          shouldSetAsInitialImage: false,
          shouldAddToStagingArea: true,
        })
      );
    }else{
      dispatch(
        mergeAndUploadCanvas({
          cropVisible: shouldCropToBoundingBoxOnSave ? false : true,
          cropToBoundingBox: shouldCropToBoundingBoxOnSave,
          shouldSetAsInitialImage: true,
        })
      );
    }
  };

  const handleSaveToGallery = () => {
    dispatch(
      mergeAndUploadCanvas({
        cropVisible: shouldCropToBoundingBoxOnSave ? false : true,
        cropToBoundingBox: shouldCropToBoundingBoxOnSave,
        shouldSaveToGallery: true,
      })
    );
  };

  const handleCopyImageToClipboard = () => {
    dispatch(
      mergeAndUploadCanvas({
        cropVisible: shouldCropToBoundingBoxOnSave ? false : true,
        cropToBoundingBox: shouldCropToBoundingBoxOnSave,
        shouldCopy: true,
      })
    );
  };

  const handleDownloadAsImage = () => {
    dispatch(
      mergeAndUploadCanvas({
        cropVisible: shouldCropToBoundingBoxOnSave ? false : true,
        cropToBoundingBox: shouldCropToBoundingBoxOnSave,
        shouldDownload: true,
      })
    );
  };

  const handleChangeLayer = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLayer = e.target.value as CanvasLayer;
    dispatch(setLayer(newLayer));
    if (newLayer === 'mask' && !isMaskEnabled) {
      dispatch(setIsMaskEnabled(true));
    }
  };


  const handleRemoveBackground = () => {
    dispatch(
      removeBackground(objects, selectedImageIndex, boundingBoxCoordinates)
    );
  };

  const handlePixImage = () => {
    dispatch(
      pixImage(objects, selectedImageIndex, prompt)
    );
  };


  const handleGenerateUpily = () => {
    let currentSeed = seed;
    if(shouldRandomizeSeed){
      currentSeed = Math.floor(Math.random() * 100000);
      dispatch(setSeed(currentSeed));
      dispatch(setShouldRandomizeSeed(true));
    }
    const data = {
      "prompt": prompt,
      "cfg": cfgScale,
      "steps": steps,
      "scheduler": sampler,
      "seed": currentSeed,
      "model": upilyModel,
    }
    dispatch(
      generateUpily(data, boundingBoxCoordinates)
    );
  };

  const handleSaveToUpilyGallery = () => {
    dispatch(
      saveToUpilyGallery(objects, selectedImageIndex)
    );
  };

  const handleDeleteObject = () => {
    dispatch(
      deleteSelectedImage()
    );
  };


  const handleSendBackward = () => {
    dispatch(
      sendBackward()
    );
  };


  const handleBringForward = () => {
    dispatch(
      bringForward()
    );
  };

  useHotkeys(
    ['w'],
    () => {
      handleSendBackward();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    []
  );

  useHotkeys(
    ['e'],
    () => {
      handleBringForward();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    []
  );

  return (
    <Flex flexDirection={'column'} columnGap="1rem" rowGap="1rem" width="2rem" paddingRight={'2.5rem'}>

      <IAICanvasToolChooserOptions />


          <IAIIconButton
            aria-label={`${t('common:saveToUpilyGallery')}`}
            tooltip={`${t('common:saveToUpilyGallery')}`}
            icon={<FaSave />}
            onClick={handleSaveToUpilyGallery}
            isDisabled={isStaging}
          />
          <IAIIconButton
            aria-label={`${t('common:bg')}`}
            tooltip={`${t('common:bg')}`}
            icon={<FaUserCheck />}
            onClick={handleRemoveBackground}
            isDisabled={isStaging}
          />
          <IAIIconButton
            aria-label={`${t('common:pix')}`}
            tooltip={`${t('common:pix')}`}
            icon={<FaCircleNotch />}
            onClick={handlePixImage}
            isDisabled={isStaging}
          />
          <IAIIconButton
            aria-label={`${t('common:gen')}`}
            tooltip={`${t('common:gen')}`}
            icon={<FaCircleNotch />}
            onClick={handleGenerateUpily}
            isDisabled={isStaging}
          />

    </Flex>
  );
};

export default IAICanvasOutpaintingControls;
