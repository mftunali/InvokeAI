import {Box, Center, Flex} from '@chakra-ui/react';
import IAICanvasToolChooserOptions from './IAICanvasToolChooserOptions';
import {FaArrowDown, FaArrowsAlt, FaArrowUp, FaTrash} from "react-icons/fa";
import IAIIconButton from "../../../../common/components/IAIIconButton";
import IAIButton from "../../../../common/components/IAIButton";
import React, {useCallback} from "react";
import {KonvaEventObject} from "konva/lib/Node";
import {bringForward, deleteSelectedImage, sendBackward, setSelectedImage} from "../../store/canvasSlice";
import {useAppDispatch} from "../../../../app/storeHooks";

import {Image} from '@chakra-ui/react';

import * as InvokeAI from 'app/invokeai';


type IAICanvasLayerObjectsProps = {
  id: string;
  kind: string;
  image: InvokeAI.Image;
  isSelected: boolean;
};




const IAICanvasLayerObject = (props: IAICanvasLayerObjectsProps) => {
  const {id, kind, image, isSelected} = props;

  const dispatch = useAppDispatch();

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



  return (<>
  <Flex flexDirection={'row'} columnGap="0.2rem">

  <IAIButton
    onClick={handleOnClick}
    variant={isSelected ? 'outline' : 'solid'}
    width='6.4rem'
    height='6.4rem'
    colorScheme='red'
    padding={0}
  >
    {
      (image != null && kind === 'image' && image.thumbnail != '') ?
      <Image src={image.thumbnail} alt={kind} width={'6rem'} height={'6rem'}/> :
      <Center css={'color:white'} width={'6rem'} height={'6rem'}>{kind}</Center>
    }
  </IAIButton>
    <Flex flexDirection={'column'} rowGap="0.2rem">
      <IAIIconButton size={'sm'} icon={<FaArrowUp/>} onClick={handleSendBackward} />
      <IAIIconButton size={'sm'} icon={<FaTrash/>} onClick={handleDeleteObject} />
      <IAIIconButton size={'sm'} icon={<FaArrowDown/>} onClick={handleBringForward} />
    </Flex>
  </Flex>

    </>
  );
};

export default IAICanvasLayerObject;
