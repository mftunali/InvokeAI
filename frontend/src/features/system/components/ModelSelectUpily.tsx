import { Flex } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { requestModelChange } from 'app/socketio/actions';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import IAISelect from 'common/components/IAISelect';
import _ from 'lodash';
import { ChangeEvent } from 'react';
import { systemSelector } from '../store/systemSelectors';
import {setUpilyModel} from "../store/systemSlice";

const selector = createSelector(
  [systemSelector],
  (system) => {
    const { upilyModel,isProcessing } = system;

    return { upilyModel, isProcessing };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);

const ModelSelectUpily = () => {
  const dispatch = useAppDispatch();
  const { upilyModel, isProcessing } =
    useAppSelector(selector);
  const handleChangeModel = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setUpilyModel(e.target.value));
  };

  const models = ['upily-style', 'upily-style-2.1', 'sd-1.5', 'sd-2.1']

  return (
    <Flex
      style={{
        paddingLeft: '0.3rem',
      }}
    >
      <IAISelect
        style={{ fontSize: '0.8rem' }}
        isDisabled={isProcessing}
        value={upilyModel}
        validValues={models}
        onChange={handleChangeModel}
      />
    </Flex>
  );
};

export default ModelSelectUpily;
