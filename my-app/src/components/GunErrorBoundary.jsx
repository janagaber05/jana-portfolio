import { Component } from 'react';
import styles from './WorkSpraySection.module.css';

/** Keeps the rest of the site up if the WebGL gun fails to boot. */
export default class GunErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('[PortfolioGun] failed:', error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <button
          type="button"
          className={styles.gunButton}
          aria-label="Spray my work"
          disabled={this.props.disabled}
          onClick={(event) => {
            event.preventDefault();
            if (!this.props.disabled) this.props.onFire?.(event);
          }}
        >
          <div className={styles.gunCanvas} aria-hidden="true" />
        </button>
      );
    }

    return this.props.children;
  }
}
