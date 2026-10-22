import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="app-error" role="alert">
          <h1>页面暂时无法显示</h1>
          <p>请重新加载页面后重试。</p>
          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
