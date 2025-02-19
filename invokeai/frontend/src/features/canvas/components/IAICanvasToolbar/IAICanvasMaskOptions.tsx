import { ButtonGroup, Flex } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import {
  clearMask,
  setIsMaskEnabled,
  setLayer,
  setMaskColor,
  setShouldPreserveMaskedArea,
} from 'features/canvas/store/canvasSlice';
import { useAppDispatch, useAppSelector } from 'app/storeHooks';
import _ from 'lodash';
import IAIIconButton from 'common/components/IAIIconButton';
import { FaMask, FaTrash } from 'react-icons/fa';
import IAIPopover from 'common/components/IAIPopover';
import IAICheckbox from 'common/components/IAICheckbox';
import IAIColorPicker from 'common/components/IAIColorPicker';
import IAIButton from 'common/components/IAIButton';
import {
  canvasSelector,
  isStagingSelector,
} from 'features/canvas/store/canvasSelectors';
import { useHotkeys } from 'react-hotkeys-hook';
import { rgbaColorToString } from 'features/canvas/util/colorToString';
import { useTranslation } from 'react-i18next';

export const selector = createSelector(
  [canvasSelector, isStagingSelector],
  (canvas, isStaging) => {
    const { maskColor, layer, isMaskEnabled, shouldPreserveMaskedArea } =
      canvas;

    return {
      layer,
      maskColor,
      maskColorString: rgbaColorToString(maskColor),
      isMaskEnabled,
      shouldPreserveMaskedArea,
      isStaging,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);
const IAICanvasMaskOptions = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const {
    layer,
    maskColor,
    isMaskEnabled,
    shouldPreserveMaskedArea,
    isStaging,
  } = useAppSelector(selector);

  useHotkeys(
    ['q'],
    () => {
      handleToggleMaskLayer();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [layer]
  );

  useHotkeys(
    ['shift+c'],
    () => {
      handleClearMask();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    []
  );

  useHotkeys(
    ['h'],
    () => {
      handleToggleEnableMask();
    },
    {
      enabled: () => !isStaging,
      preventDefault: true,
    },
    [isMaskEnabled]
  );

  const handleToggleMaskLayer = () => {
    dispatch(setLayer(layer === 'mask' ? 'base' : 'mask'));
  };

  const handleClearMask = () => dispatch(clearMask());

  const handleToggleEnableMask = () =>
    dispatch(setIsMaskEnabled(!isMaskEnabled));

  return (
    <IAIPopover
      trigger="hover"
      triggerComponent={
        <IAIIconButton
          aria-label={t('unifiedcanvas:maskingOptions')}
          tooltip={t('unifiedcanvas:maskingOptions')}
          onClick={handleToggleEnableMask}
          icon={<FaMask />}
          style={
            layer === 'mask'
              ? { backgroundColor: 'var(--accent-color)' }
              : { backgroundColor: 'var(--btn-base-color)' }
          }
          isDisabled={isStaging}
        />
      }
    >
      <Flex direction={'column'} gap={'0.5rem'}>

        <IAICheckbox
          label={t('unifiedcanvas:preserveMaskedArea')}
          isChecked={shouldPreserveMaskedArea}
          onChange={(e) =>
            dispatch(setShouldPreserveMaskedArea(e.target.checked))
          }
        />
        <IAIColorPicker
          style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
          color={maskColor}
          onChange={(newColor) => dispatch(setMaskColor(newColor))}
        />
        <IAIButton size={'sm'} leftIcon={<FaTrash />} onClick={handleClearMask}>
          {t('unifiedcanvas:clearMask')} (Shift+C)
        </IAIButton>
      </Flex>
    </IAIPopover>
  );
};

export default IAICanvasMaskOptions;
