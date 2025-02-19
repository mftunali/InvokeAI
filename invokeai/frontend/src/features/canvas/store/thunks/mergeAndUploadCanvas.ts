import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { RootState } from 'app/store';
import * as InvokeAI from 'app/invokeai';
import { v4 as uuidv4 } from 'uuid';
import layerToDataURL from '../../util/layerToDataURL';
import downloadFile from '../../util/downloadFile';
import copyImage from '../../util/copyImage';
import { getCanvasBaseLayer } from '../../util/konvaInstanceProvider';
import {
  addToast,
  setCurrentStatus,
  setIsCancelable,
  setIsProcessing,
  setProcessingIndeterminateTask,
} from 'features/system/store/systemSlice';
import { addImage } from 'features/gallery/store/gallerySlice';
import {addImageToStagingArea, setMergedCanvas} from '../canvasSlice';
import { CanvasState } from '../canvasTypes';
import i18n from 'i18n';

type MergeAndUploadCanvasConfig = {
  cropVisible?: boolean;
  cropToBoundingBox?: boolean;
  shouldSaveToGallery?: boolean;
  shouldDownload?: boolean;
  shouldCopy?: boolean;
  shouldSetAsInitialImage?: boolean;
  shouldAddToStagingArea?: boolean;
};

const defaultConfig: MergeAndUploadCanvasConfig = {
  cropVisible: false,
  cropToBoundingBox: false,
  shouldSaveToGallery: false,
  shouldDownload: false,
  shouldCopy: false,
  shouldSetAsInitialImage: true,
  shouldAddToStagingArea: false,
};

export const mergeAndUploadCanvas =
  (config = defaultConfig): ThunkAction<void, RootState, unknown, AnyAction> =>
  async (dispatch, getState) => {
    const {
      cropVisible,
      cropToBoundingBox,
      shouldSaveToGallery,
      shouldDownload,
      shouldCopy,
      shouldSetAsInitialImage,
      shouldAddToStagingArea,
    } = config;

    dispatch(setProcessingIndeterminateTask('Exporting Image'));
    dispatch(setIsCancelable(false));

    const state = getState() as RootState;

    const {
      stageScale,
      boundingBoxCoordinates,
      boundingBoxDimensions,
      stageCoordinates,
    } = state.canvas as CanvasState;

    const canvasBaseLayer = getCanvasBaseLayer();

    if (!canvasBaseLayer) {
      dispatch(setIsProcessing(false));
      dispatch(setIsCancelable(true));

      return;
    }

    const { dataURL, boundingBox: originalBoundingBox } = layerToDataURL(
      canvasBaseLayer,
      stageScale,
      stageCoordinates,
      cropToBoundingBox
        ? { ...boundingBoxCoordinates, ...boundingBoxDimensions }
        : undefined
    );

    if (!dataURL) {
      dispatch(setIsProcessing(false));
      dispatch(setIsCancelable(true));
      return;
    }

    const formData = new FormData();

    formData.append(
      'data',
      JSON.stringify({
        dataURL,
        filename: 'merged_canvas.png',
        kind: shouldSaveToGallery ? 'result' : 'temp',
        cropVisible,
      })
    );

    const response = await fetch(window.location.origin + '/upload', {
      method: 'POST',
      body: formData,
    });

    const image = (await response.json()) as InvokeAI.ImageUploadResponse;

    const { url, width, height } = image;

    const newImage: InvokeAI.Image = {
      uuid: uuidv4(),
      category: shouldSaveToGallery ? 'result' : 'user',
      ...image,
    };

    if (shouldDownload) {
      downloadFile(url);
      dispatch(
        addToast({
          title: i18n.t('toast:downloadImageStarted'),
          status: 'success',
          duration: 2500,
          isClosable: true,
        })
      );
    }

    if (shouldCopy) {
      copyImage(url, width, height);
      dispatch(
        addToast({
          title: i18n.t('toast:imageCopied'),
          status: 'success',
          duration: 2500,
          isClosable: true,
        })
      );
    }

    if (shouldSaveToGallery) {
      dispatch(addImage({ image: newImage, category: 'result' }));
      dispatch(
        addToast({
          title: i18n.t('toast:imageSavedToGallery'),
          status: 'success',
          duration: 2500,
          isClosable: true,
        })
      );
    }

    if (shouldSetAsInitialImage) {
      dispatch(
        setMergedCanvas({
          kind: 'image',
          layer: 'base',
          ...originalBoundingBox,
          image: newImage,
        })
      );
      dispatch(
        addToast({
          title: i18n.t('toast:canvasMerged'),
          status: 'success',
          duration: 2500,
          isClosable: true,
        })
      );
    }

    if (shouldAddToStagingArea) {
      dispatch(
        addImageToStagingArea({
          image:newImage,
          boundingBox: {x: 0, y: 1024, width: newImage.width, height: newImage.height},
        })
      );
    }

    dispatch(setIsProcessing(false));
    dispatch(setCurrentStatus(i18n.t('common:statusConnected')));
    dispatch(setIsCancelable(true));
  };
