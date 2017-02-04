var WysiwygEditor0 = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    name: React.PropTypes.string,
    textValue: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {
      textValue: '',
      name: 'hoge'
    };
  },
  getInitialState: function() {
    return {
      textValue: this.props.textValue,
      name: 'hoge'
    };
  },
  componentWillMount: function() {
    if (this.ta) {
      return;
    }
    this.ta = document.createElement('textarea');
    this.ta.setAttribute("name", this.props.name);
    this.ta.value = this.props.textValue;
    $(this.ta).hide();
  },
  componentDidMount: function() {
    ReactDOM.findDOMNode(this).appendChild(this.ta);

    var child = ReactDOM.findDOMNode(this.refs.editor);
    this.editor = $(child).trumbowyg();
    this.editor
      .on('tbwchange', this.handleChange);
//      .on('tbwblur', this.handleChange);

    this.editor.trumbowyg('html', this.props.textValue);
  },
  handleChange: function(event) {
    console.log('--- handleChange ---');
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    var html = $(ReactDOM.findDOMNode(this.refs.editor)).trumbowyg('html');
    this.setState({textValue: html});
    this.ta.value = html;
  },
  componentWillReceiveProps: function() {
    this.setState({textValue: this.props.textValue});
  },
  // componentDidUpdate: function() {
  //   if ($(ReactDOM.findDOMNode(this.refs.editor)).trumbowyg('html') === this.props.textValue) return;
  //   this.componentWillUnMount();
  //   this.componentWillMount();
  //   this.componentDidMount();
  // },
  componentWillUnMount: function () {
    $(this.editor).off();
    ReactDOM.findDOMNode(this).removeChild(this.ta);
    this.editor = null;
    this.ta = null;
  },
  render: function() {
    return (
        <div><div ref="editor" /></div>
      );
  }
});
