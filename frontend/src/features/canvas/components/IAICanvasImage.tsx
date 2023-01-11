import { Image, Transformer} from 'react-konva';
import useImage from 'use-image';
import React, {useCallback, useEffect, useRef, useState} from "react";
import {KonvaEventObject} from "konva/lib/Node";
import {
  setImageDimensions,
  setImageCoordinates,
  setImageRotation,
  setSelectedImage,
  dragEnd, transformEnd, setBoundingBoxCoordinates
} from "../store/canvasSlice";
import {roundDownToMultiple, roundToMultiple} from "../../../common/util/roundDownToMultiple";

import {useAppDispatch, useAppSelector} from 'app/storeHooks';
import Konva from "konva";
import {createSelector} from "@reduxjs/toolkit";
import {canvasSelector} from "../store/canvasSelectors";
import _ from "lodash";


const boundingBoxPreviewSelector = createSelector(
  canvasSelector,
  (canvas) => {
    const {
      shouldSnapToGrid,
    } = canvas;

    return {
      shouldSnapToGrid,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);


type IAICanvasImageProps = {
  url: string;
  x: number;
  y: number;
  id: string;
  width: number;
  height: number;
  rotation: number;
  isSelected: boolean;
};


const IAICanvasImage = (props: IAICanvasImageProps) => {
  const { url, x, y, id, width, height, rotation, isSelected } = props;
  const [image] = useImage(url);


  const dispatch = useAppDispatch();
    const {
      shouldSnapToGrid,
    } = useAppSelector(boundingBoxPreviewSelector);


  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRef = useRef<Konva.Image>(null);


  useEffect(() => {
    if (isSelected) {
    if (!transformerRef.current || !shapeRef.current) return;
    transformerRef.current.nodes([shapeRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleOnClick = useCallback(
    (e: KonvaEventObject<DragEvent>) => {

      dispatch(
        setSelectedImage({
          id: id,
        })
      );
      return;

    },
    [id, dispatch]
  );


  const handleOnDragMove2 = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      if (!shouldSnapToGrid) {
        dispatch(
          setImageCoordinates({
            id: id,
            x: Math.floor(e.target.x()),
            y: Math.floor(e.target.y()),
          })
        );
        return;
      }


      const dragX = e.target.x();
      const dragY = e.target.y();

      const newX = roundToMultiple(dragX, 64);
      const newY = roundToMultiple(dragY, 64);

      e.target.x(newX);
      e.target.y(newY);

      dispatch(
        setImageCoordinates({
          id: id,
          x: newX,
          y: newY,
        })
      );
    },

    [id, shouldSnapToGrid, dispatch]
  );

  const handleOnTransform = useCallback(() => {
    /**
     * The Konva Transformer changes the object's anchor point and scale factor,
     * not its width and height. We need to un-scale the width and height before
     * setting the values.
     */

    if (!shapeRef.current) return;

    const rect = shapeRef.current;

    const scaleX = rect.scaleX();
    const scaleY = rect.scaleY();
    const rotation = rect.rotation();

    // undo the scaling
    const width = Math.round(rect.width() * scaleX);
    const height = Math.round(rect.height() * scaleY);

    const x = Math.round(rect.x());
    const y = Math.round(rect.y());



    dispatch(
      setImageRotation({
        id: id,
        rotation: rotation,
      })
    );

    dispatch(
      setImageDimensions({
        id: id,
        width: width,
        height: height,
      })
    );

    dispatch(
      setImageCoordinates({
        id: id,
        x: x,
        y: y,
      })
    );

    // Reset the scale now that the coords/dimensions have been un-scaled
    rect.scaleX(1);
    rect.scaleY(1);
  }, [id, dispatch]);


  const handleOnDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      dispatch(
        dragEnd()
      );
      return;
    },
    [dispatch]
  );


  const handleOnTransformEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      dispatch(
        transformEnd()
      );
      return;
    },
    [dispatch]
  );

  return <>
    <Image
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      image={image}
      listening={true}
      draggable={true}
      onDragMove={handleOnDragMove2}
      onDragEnd={handleOnDragEnd}
      onClick={handleOnClick}
      onTransform={handleOnTransform}
      onTransformEnd={handleOnTransformEnd}
      ref={shapeRef}
    />
    {isSelected && <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // limit resize
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox;
        }
        return newBox;
      }}
    />}
    </>;
};

export default IAICanvasImage;
