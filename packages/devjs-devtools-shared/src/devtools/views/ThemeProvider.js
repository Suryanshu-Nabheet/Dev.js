/**
 * Copyright (c) Suryanshu Nabheet.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as Devjs from 'devjs';
import useThemeStyles from './useThemeStyles';

export default function ThemeProvider({
  children,
}: {
  children: Devjs.Node,
}): Devjs.Node {
  const themeStyle = useThemeStyles();

  const style = Devjs.useMemo(() => {
    return {
      ...themeStyle,
      width: '100%',
      height: '100%',
    };
  }, [themeStyle]);

  return <div style={style}>{children}</div>;
}
