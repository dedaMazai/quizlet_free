import { FC } from 'react';
import { Button, Space } from 'antd';
import { BugOutlined } from '@ant-design/icons';

interface ErrorTestButtonsProps {
  className?: string;
}

export const ErrorTestButtons: FC<ErrorTestButtonsProps> = () => {

  // Показываем только в dev режиме
  if (!__IS_DEV__) {
    return null;
  }

  const throwRenderError = () => {
    throw new Error('Test Render Error - React Error Boundary should catch this');
  };

  const throwAsyncError = () => {
    setTimeout(() => {
      throw new Error('Test Async Error - This will NOT be caught by Error Boundary');
    }, 100);
  };

  const throwChunkError = () => {
    const error = new Error('Loading chunk 123 failed');
    error.name = 'ChunkLoadError';
    throw error;
  };

  const throwNetworkError = () => {
    const error = new Error('Network request failed');
    error.name = 'NetworkError';
    throw error;
  };

  const simulateRouterError = () => {
    // Переход на несуществующий роут для тестирования Router Error
    window.history.pushState({}, '', '/non-existent-route-test-404');
    window.location.reload();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      zIndex: 9999,
      background: 'var(--bg-color-secondary)',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid var(--border-light)',
      boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
        🧪 Error Tests (DEV only)
      </div>

      <Space direction="vertical" size="small">
        <Button 
          size="small" 
          icon={<BugOutlined />} 
          onClick={throwRenderError}
          danger
        >
          React Error
        </Button>
        <Button 
          size="small" 
          icon={<BugOutlined />} 
          onClick={throwChunkError}
          danger
        >
          Chunk Error
        </Button>
        <Button 
          size="small" 
          icon={<BugOutlined />} 
          onClick={throwNetworkError}
          danger
        >
          Network Error
        </Button>
        <Button 
          size="small" 
          icon={<BugOutlined />} 
          onClick={simulateRouterError}
          danger
        >
          Router 404
        </Button>
        <Button 
          size="small" 
          icon={<BugOutlined />} 
          onClick={throwAsyncError}
          type="dashed"
        >
          Async Error (uncaught)
        </Button>
      </Space>
    </div>
  );
};
