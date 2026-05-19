import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import CustomNode from '../CustomNode';

describe('CustomNode', () => {
  it('renders the function name correctly', () => {
    const nodeData = {
      label: 'testFunction',
      details: {
        docs: 'Test docs',
      }
    };

    render(
      <ReactFlowProvider>
        <CustomNode data={nodeData} selected={false} />
      </ReactFlowProvider>
    );

    expect(screen.getByText('testFunction')).toBeInTheDocument();
  });
});
