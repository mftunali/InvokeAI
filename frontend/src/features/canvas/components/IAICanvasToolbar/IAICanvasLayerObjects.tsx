import {ButtonGroup, Flex} from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import _ from 'lodash';
import IAICanvasToolChooserOptions from './IAICanvasToolChooserOptions';
import {
  canvasSelector,
} from 'features/canvas/store/canvasSelectors';
import IAICanvasLayerObject from "./IAICanvasLayerObject";
import HoverableImage from "../../../gallery/components/HoverableImage";
import {Button} from "@chakra-ui/button";
import {MdPhotoLibrary} from "react-icons/md";
import React from "react";
import IAICanvasImage from "../IAICanvasImage";
import * as InvokeAI from "../../../../app/invokeai";

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

const IAICanvasLayerObjects = () => {
  const dispatch = useAppDispatch();

  const {
    objects,
    selectedImageIndex,
  } = useAppSelector(layerSelector);

  console.log(objects);

  return (
    <div >
      <Flex flexDirection={'column'} rowGap="0.1rem" className={'layer-objects-container'}>
        {objects.map((object, index) => (
          <IAICanvasLayerObject
            key={object.id}
            id={object.id}
            kind={object.kind}
            image={(object.image != null) ?object.image: null}
            isSelected={index === selectedImageIndex}
          />
        ))}
      </Flex>
      </div>
  );
};

export default IAICanvasLayerObjects;
