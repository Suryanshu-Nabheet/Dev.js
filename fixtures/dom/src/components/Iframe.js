const Devjs = window.Devjs;
const DevjsDOM = window.DevjsDOM;

class IframePortal extends Devjs.Component {
  iframeRef = null;

  handleRef = ref => {
    if (ref !== this.iframeRef) {
      this.iframeRef = ref;
      if (ref) {
        if (ref.contentDocument && this.props.head) {
          ref.contentDocument.head.innerHTML = this.props.head;
        }
        // Re-render must take place in the next tick (Firefox)
        setTimeout(() => {
          this.forceUpdate();
        });
      }
    }
  };

  render() {
    const ref = this.iframeRef;
    let portal = null;
    if (ref && ref.contentDocument) {
      portal = DevjsDOM.createPortal(
        this.props.children,
        ref.contentDocument.body
      );
    }

    return (
      <div>
        <iframe
          title="Iframe portal"
          style={{border: 'none', height: this.props.height}}
          ref={this.handleRef}
        />
        {portal}
      </div>
    );
  }
}

class IframeSubtree extends Devjs.Component {
  warned = false;
  render() {
    if (!this.warned) {
      console.error(
        `IFrame has not yet been implemented for Devjs v${Devjs.version}`
      );
      this.warned = true;
    }
    return <div>{this.props.children}</div>;
  }
}

export default DevjsDOM.createPortal ? IframePortal : IframeSubtree;
