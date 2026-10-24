import { useRef } from 'react';
import { TextInput, LayoutChangeEvent } from 'react-native';

export function useFormScrollToError() {
  const scrollViewRef = useRef<any>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | any }>({});
  const fieldPositions = useRef<{ [key: string]: number }>({});

  const registerInput = (key: string) => (ref: any) => {
    inputRefs.current[key] = ref;
  };

  const registerField = (key: string) => ({
    onLayout: (e: LayoutChangeEvent) => {
      fieldPositions.current[key] = e.nativeEvent.layout.y;
    },
  });

  const scrollToError = (fieldKey: string, offset = 24) => {
    requestAnimationFrame(() => {
      const y = fieldPositions.current[fieldKey];
      if (y !== undefined && scrollViewRef.current) {
        const scrollY = Math.max(0, y - offset);
        if (typeof scrollViewRef.current.scrollToPosition === 'function') {
          scrollViewRef.current.scrollToPosition(0, scrollY, true);
        } else if (typeof scrollViewRef.current.scrollTo === 'function') {
          scrollViewRef.current.scrollTo({ y: scrollY, animated: true });
        }
      }

      const input = inputRefs.current[fieldKey];
      if (input) {
        setTimeout(() => {
          if (typeof input.focus === 'function') {
            input.focus();
          } else if (input.textInput && typeof input.textInput.focus === 'function') {
            input.textInput.focus();
          }
        }, 150);
      }
    });
  };

  const scrollToFirstError = (
    errors: { [key: string]: any },
    fieldOrder: string[],
    offset = 24
  ): boolean => {
    const firstError = fieldOrder.find((field) => Boolean(errors[field]));
    if (firstError) {
      scrollToError(firstError, offset);
      return true;
    }
    return false;
  };

  return {
    scrollViewRef,
    inputRefs,
    fieldPositions,
    registerInput,
    registerField,
    scrollToError,
    scrollToFirstError,
  };
}
