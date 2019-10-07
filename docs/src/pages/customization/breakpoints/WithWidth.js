import React from 'react';
import PropTypes from 'prop-types';
import withWidth from '@material-ui/core/withWidth';
import Typography from '@material-ui/core/Typography';

const components = {
  sm: 'em',
  md: 'u',
  lg: 'del',
  xs: 'b',
  xl: 'h5',
};

function WithWidthComp(props) {
  const { width } = props;
  const Component = components[width] || 'span';

  return (
    <Typography variant="subtitle1">
      <Component>{`Current width: ${width}`}</Component>
    </Typography>
  );
}

WithWidthComp.propTypes = {
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

export default withWidth()(WithWidthComp);
