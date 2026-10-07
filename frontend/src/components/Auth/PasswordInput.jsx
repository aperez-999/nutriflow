import { useState } from 'react';
import { IconButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

/** Password field with a show/hide toggle. Passes other props to the input. */
export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup>
      <Input type={visible ? 'text' : 'password'} pr={10} {...props} />
      <InputRightElement>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label={visible ? 'Hide password' : 'Show password'}
          icon={visible ? <ViewOffIcon /> : <ViewIcon />}
          onClick={() => setVisible((v) => !v)}
        />
      </InputRightElement>
    </InputGroup>
  );
}
