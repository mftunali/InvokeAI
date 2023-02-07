import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import { KonvaEventObject } from 'konva/lib/Node';
import _ from 'lodash';
import { useCallback } from 'react';
import {
  canvasSelector,
  isStagingSelector,
} from 'features/canvas/store/canvasSelectors';
import {
  setIsMovingStage,
  setStageCoordinates,
} from 'features/canvas/store/canvasSlice';

const selector = createSelector(
  [canvasSelector, isStagingSelector],
  (canvas, isStaging) => {
    const { tool, isMovingBoundingBox, isMovingImage, isTransformingImage } = canvas;
    return {
      tool,
      isStaging,
      isMovingBoundingBox,
      isMovingImage,
      isModifyingImage: isTransformingImage || isMovingImage,
    };
  },
  { memoizeOptions: { resultEqualityCheck: _.isEqual } }
);

const useCanvasDrag = () => {
  const dispatch = useAppDispatch();
  const { tool, isStaging, isMovingBoundingBox, isMovingImage, isModifyingImage } = useAppSelector(selector);

  return {
    handleDragStart: useCallback(() => {
      if (!((tool === 'move' || isStaging) && !isMovingBoundingBox && !isModifyingImage)) return;
      dispatch(setIsMovingStage(true));
    }, [dispatch, isMovingBoundingBox, isModifyingImage, isStaging, tool]),

    handleDragMove: useCallback(
      (e: KonvaEventObject<MouseEvent>) => {
        if (!((tool === 'move' || isStaging) && !isMovingBoundingBox && !isModifyingImage)) return;
        const newCoordinates = { x: e.target.x(), y: e.target.y() };

        dispatch(setStageCoordinates(newCoordinates));
      },
      [dispatch, isMovingBoundingBox, isModifyingImage, isStaging, tool]
    ),

    handleDragEnd: useCallback(() => {
      if (!((tool === 'move' || isStaging) && !isMovingBoundingBox && !isModifyingImage)) return;
      dispatch(setIsMovingStage(false));
    }, [dispatch, isMovingBoundingBox, isModifyingImage, isStaging, tool]),
  };
};

export default useCanvasDrag;
