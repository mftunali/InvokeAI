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
  setTool,
} from 'features/canvas/store/canvasSlice';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import _ from 'lodash';
import IAIIconButton from 'common/components/IAIIconButton';
import {
  FaArrowsAlt, FaBackward,
  FaCopy,
  FaCrosshairs,
  FaDownload, FaForward,
  FaLayerGroup, FaRemoveFormat,
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
import IAICanvasLayerObject from "./IAICanvasLayerObject";
import IAICanvasLayerObjects from "./IAICanvasLayerObjects";

export const selector = createSelector(
  [systemSelector, canvasSelector, isStagingSelector],
  (system, canvas, isStaging) => {
    const { isProcessing } = system;
    const { tool, shouldCropToBoundingBoxOnSave, layer, isMaskEnabled } =
      canvas;

    return {
      isProcessing,
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


const IAICanvasLayerControls = () => {
  const dispatch = useAppDispatch();
  const {
    isProcessing,
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
      removeBackground(objects, selectedImageIndex)
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
    <Flex flexDirection={'column'} columnGap="1rem" rowGap="1rem" width="10rem" paddingRight={'1rem'}>
      <Flex flexDirection={'row'} columnGap="0.2rem" rowGap="1rem">
      <IAISelect
        tooltip={`${t('unifiedcanvas:layer')} (Q)`}
        tooltipProps={{ hasArrow: true, placement: 'top' }}
        value={layer}
        validValues={LAYER_NAMES_DICT}
        onChange={handleChangeLayer}
        isDisabled={isStaging}
      />

      <IAICanvasMaskOptions />
      </Flex>

      <IAICanvasLayerObjects />
    </Flex>
  );
};

export default IAICanvasLayerControls;
