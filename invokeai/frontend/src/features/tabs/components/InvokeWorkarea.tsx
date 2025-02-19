import { Tooltip } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { DragEvent, ReactNode } from 'react';
import { VscSplitHorizontal } from 'react-icons/vsc';
import { RootState } from 'app/store';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import ImageGallery from 'features/gallery/components/ImageGallery';
import { activeTabNameSelector } from 'features/options/store/optionsSelectors';
import {
  OptionsState,
  setInitialImage,
  setShowDualDisplay,
} from 'features/options/store/optionsSlice';
import {
  addImageToStagingArea,
  setDoesCanvasNeedScaling,
  setInitialCanvasImage,
} from 'features/canvas/store/canvasSlice';
import _ from 'lodash';
import useGetImageByUuid from 'features/gallery/hooks/useGetImageByUuid';
import {canvasSelector} from "../../canvas/store/canvasSelectors";


const bboxSelector = createSelector(
  canvasSelector,
  (canvas) => {
    const {
      boundingBoxCoordinates,
      boundingBoxDimensions,
    } = canvas;

    return {
      boundingBoxCoordinates,
      boundingBoxDimensions,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);

const workareaSelector = createSelector(
  [(state: RootState) => state.options, activeTabNameSelector],
  (options: OptionsState, activeTabName) => {
    const { showDualDisplay, shouldPinOptionsPanel, isLightBoxOpen } = options;
    return {
      showDualDisplay,
      shouldPinOptionsPanel,
      isLightBoxOpen,
      shouldShowDualDisplayButton: ['inpainting'].includes(activeTabName),
      activeTabName,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);

type InvokeWorkareaProps = {
  optionsPanel: ReactNode;
  children: ReactNode;
  styleClass?: string;
};

const InvokeWorkarea = (props: InvokeWorkareaProps) => {
  const dispatch = useAppDispatch();
  const { optionsPanel, children, styleClass } = props;
  const {
    activeTabName,
    showDualDisplay,
    isLightBoxOpen,
    shouldShowDualDisplayButton,
  } = useAppSelector(workareaSelector);

  const {
    boundingBoxCoordinates,
  } = useAppSelector(bboxSelector);

  const getImageByUuid = useGetImageByUuid();

  const handleDualDisplay = () => {
    dispatch(setShowDualDisplay(!showDualDisplay));
    dispatch(setDoesCanvasNeedScaling(true));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    const uuid = e.dataTransfer.getData('invokeai/imageUuid');
    const image = getImageByUuid(uuid);
    if (!image) return;
    if (activeTabName === 'img2img') {
      dispatch(setInitialImage(image));
    } else if (activeTabName === 'unifiedCanvas') {
      // dispatch(setInitialCanvasImage(image));
      dispatch(addImageToStagingArea({
        image:image,
        boundingBox: {x: boundingBoxCoordinates.x, y: boundingBoxCoordinates.y, width: image.width, height: image.height},
      }));
    }
  };

  return (
    <div
      className={
        styleClass ? `workarea-wrapper ${styleClass}` : `workarea-wrapper`
      }
    >
      <div className="workarea-main">
        {optionsPanel}
        <div className="workarea-children-wrapper" onDrop={handleDrop}>
          {children}
          {shouldShowDualDisplayButton && (
            <Tooltip label="Toggle Split View">
              <div
                className="workarea-split-button"
                data-selected={showDualDisplay}
                onClick={handleDualDisplay}
              >
                <VscSplitHorizontal />
              </div>
            </Tooltip>
          )}
        </div>
        {!isLightBoxOpen && <ImageGallery />}
      </div>
    </div>
  );
};

export default InvokeWorkarea;
