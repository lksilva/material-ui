import React from 'react';
import PropTypes from 'prop-types';
import EventListener from 'react-event-listener';
import debounce from 'debounce'; // < 1kb payload overhead when lodash/debounce is > 3kb.
import { getDisplayName } from '@material-ui/utils';
import { getThemeProps } from '@material-ui/styles';
import hoistNonReactStatics from 'hoist-non-react-statics';
import withTheme from '../styles/withTheme';
import { keys as breakpointKeys } from '../styles/createBreakpoints';

// By default, returns true if screen width is the same or greater than the given breakpoint.
export const isWidthUp = (breakpoint, width, inclusive = true) => {
  if (inclusive) {
    return breakpointKeys.indexOf(breakpoint) <= breakpointKeys.indexOf(width);
  }
  return breakpointKeys.indexOf(breakpoint) < breakpointKeys.indexOf(width);
};

// By default, returns true if screen width is the same or less than the given breakpoint.
export const isWidthDown = (breakpoint, width, inclusive = true) => {
  if (inclusive) {
    return breakpointKeys.indexOf(width) <= breakpointKeys.indexOf(breakpoint);
  }
  return breakpointKeys.indexOf(width) < breakpointKeys.indexOf(breakpoint);
};

const withWidth = (options = {}) => Component => {
  const {
    withTheme: withThemeOption = false,
    noSSR = false,
    initialWidth: initialWidthOption,
    resizeInterval = 166, // Corresponds to 10 frames at 60 Hz.
  } = options;

function WithWidth(props) {
  let handleResize = null;
  const getWidth = (innerWidth = window.innerWidth) => {
    const breakpoints = props.theme.breakpoints;
    let width = null;

    /**
     * Start with the slowest value as low end devices often have a small screen.
     *
     * innerWidth |xs      sm      md      lg      xl
     *            |-------|-------|-------|-------|------>
     * width      |  xs   |  sm   |  md   |  lg   |  xl
     */
    let index = 1;
    while (width === null && index < breakpointKeys.length) {
      const currentWidth = breakpointKeys[index];

      // @media are inclusive, so reproduce the behavior here.
      if (innerWidth < breakpoints.values[currentWidth]) {
        width = breakpointKeys[index - 1];
        break;
      }

      index += 1;
    }

    width = width || 'xl';
    return width;
  }

    const initialPayload= noSSR ? getWidth() : undefined;
    const [widthState, setWidth] =  React.useState(initialPayload);

    if (typeof window !== 'undefined') {
      handleResize = debounce(() => {
        const width2 = getWidth();
        if (width2 !== widthState) {
          setWidth(width2)
        }
      }, resizeInterval);
    };

    React.useEffect(() => {
      const width2 = getWidth();
      if (width2 !== widthState) {
        setWidth(width2);
      }
    }, []);

    React.useEffect(() => {
      return () => {
        if (handleResize) {
          handleResize.clear();
        }
      }
    }, [handleResize]);

      const { initialWidth, theme, width, ...other } = getThemeProps({
        theme: props.theme,
        name: 'MuiWithWidth',
        props: { ...props },
      });

      const more = {
        width: width || widthState || initialWidth || initialWidthOption,
        ...other,
      };

      // When rendering the component on the server,
      // we have no idea about the client browser screen width.
      // In order to prevent blinks and help the reconciliation of the React tree
      // we are not rendering the child component.
      //
      // An alternative is to use the `initialWidth` property.
      if (more.width === undefined) {
        return null;
      }

      if (withThemeOption) {
        more.theme = theme;
      }

      return (
        <React.Fragment>
          <Component {...more} />
          <EventListener target="window" onResize={handleResize} />
        </React.Fragment>
      );
  }

  WithWidth.propTypes = {
    /**
     * As `window.innerWidth` is unavailable on the server,
     * we default to rendering an empty component during the first mount.
     * You might want to use an heuristic to approximate
     * the screen width of the client browser screen width.
     *
     * For instance, you could be using the user-agent or the client-hints.
     * https://caniuse.com/#search=client%20hint
     */
    initialWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    /**
     * @ignore
     */
    theme: PropTypes.object.isRequired,
    /**
     * Bypass the width calculation logic.
     */
    width: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  };

  if (process.env.NODE_ENV !== 'production') {
    WithWidth.displayName = `WithWidth(${getDisplayName(Component)})`;
  }

  hoistNonReactStatics(WithWidth, Component);

  return withTheme(WithWidth);
};

export default withWidth;
