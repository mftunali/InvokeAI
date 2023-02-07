import {Box, Center, Flex, useToast} from '@chakra-ui/react';
import IAICanvasToolChooserOptions from './IAICanvasToolChooserOptions';
import {FaArrowDown, FaArrowsAlt, FaArrowUp, FaSeedling, FaTrash} from "react-icons/fa";
import IAIIconButton from "../../../../common/components/IAIIconButton";
import IAIButton from "../../../../common/components/IAIButton";
import React, {useCallback} from "react";
import {KonvaEventObject} from "konva/lib/Node";
import {bringForward, deleteSelectedImage, sendBackward, setSelectedImage} from "../../store/canvasSlice";
import {useAppDispatch} from "../../../../app/storeHooks";
import { useTranslation } from 'react-i18next';

import {Image} from '@chakra-ui/react';

import * as InvokeAI from 'app/invokeai';
import {setSeed} from "../../../options/store/optionsSlice";


type IAICanvasLayerObjectsProps = {
  id: string;
  kind: string;
  image: InvokeAI.Image;
  isSelected: boolean;
};




const IAICanvasLayerObject = (props: IAICanvasLayerObjectsProps) => {
  const {id, kind, image, isSelected} = props;

  const dispatch = useAppDispatch();

  const toast = useToast();

  const { t } = useTranslation();

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


  const handleDeleteObject = () => {
    dispatch(setSelectedImage({id: id,}));
    dispatch(deleteSelectedImage());
  };


  const handleSendBackward = () => {
    dispatch(setSelectedImage({id: id,}));
    dispatch(sendBackward());
  };


  const handleBringForward = () => {
    dispatch(setSelectedImage({id: id,}));
    dispatch(bringForward());
  };

  const handleUseSeed = () => {
    image.metadata && dispatch(setSeed(image.metadata.image.seed));
    toast({
      title: t('toast:seedSet'),
      status: 'success',
      duration: 2500,
      isClosable: true,
    });
  };

  return (<>
  <Flex flexDirection={'row'} columnGap="0.2rem">

  <IAIButton
    onClick={handleOnClick}
    variant={isSelected ? 'outline' : 'solid'}
    width='8.4rem'
    height='6.4rem'
    colorScheme='red'
    padding={0}
  >
    <Flex flexDirection={'column'} rowGap="0.2rem">
    {
      (image != null && kind === 'image' && image.thumbnail != '') ?
      <Image src={image.thumbnail} alt={kind} width={'6rem'} height={'6rem'}/> :
      <Center css={'color:white'} width={'6rem'} height={'6rem'}>{kind}</Center>
    }
    {
      (image != null && kind === 'image' && image.metadata != null && image.metadata.image != null) ?
        <Center css={'color:white;font-size: 0.6rem;position: absolute'} width={'6rem'} height={'1rem'}>{image.metadata?.image.seed}</Center> :
        <Center css={'color:white;font-size: 0.6rem;position: absolute'} width={'6rem'} height={'1rem'}>No seed</Center>
    }
      <IAIIconButton css={'position: absolute;left: 0.1rem;top: 0.1rem;'} size={'xs'} icon={<FaSeedling/>} onClick={handleUseSeed} />
      <IAIIconButton css={'position: absolute;left: 0.1rem;bottom: 0.1rem;'} size={'xs'} icon={<FaTrash/>} onClick={handleDeleteObject} />

      <IAIIconButton css={'position: absolute;right: 0.1rem;top: 0.1rem;'} size={'xs'} icon={<FaArrowUp/>} onClick={handleSendBackward} />
      <IAIIconButton css={'position: absolute;right: 0.1rem;bottom: 0.1rem;'} size={'xs'} icon={<FaArrowDown/>} onClick={handleBringForward} />
    </Flex>
  </IAIButton>
  </Flex>

    </>
  );
};

export default IAICanvasLayerObject;
