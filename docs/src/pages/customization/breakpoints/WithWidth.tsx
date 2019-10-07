import React from 'react';
import withWidth, { WithWidth } from '@material-ui/core/withWidth';
import Typography from '@material-ui/core/Typography';

const components = {
  sm: 'em',
  md: 'u',
  lg: 'del',
  xs: 'b',
  xl: 'h5',
};

function WithWidthComp(props: WithWidth) {
  const { width } = props;
  const Component: any = components[width] || 'span';

  return (
    <Typography variant="subtitle1">
      <Component>{`Current width: ${width}`}</Component>
    </Typography>
  );
}

export default withWidth()(WithWidthComp);
