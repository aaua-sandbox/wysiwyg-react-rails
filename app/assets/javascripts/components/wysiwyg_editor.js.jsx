var Editor = React.createClass({
  getInitialState: function() {
    return {
      data: {
        name: 'hoge',
        html: '<p>hogeee</p>'
      }
    };
  },
  // componentDidMount: function() {
  //   this.loadCommentsFromServer();
  //   setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  // },
  handleEditorChange: function(html) {
    this.setState({ data: html });
  },
  render: function() {
    return (
      <table style={{tableLayout: "fixed", width: "100%"}}>
        <tr>
          <td style={{width: "50%", verticalAlign: "top"}}>
            <WysiwygEditor onEditorChange={this.handleEditorChange} data={this.state.data} />
          </td>
          <td style={{width: "50%", verticalAlign: "top", border: "solid 1px #dddddd", borderRadius: "4px", padding: "10px"}}>
            <WysiwygPreview data={this.state.data} />
          </td>
        </tr>
      </table>
    );
  }
});

var WysiwygPreview = React.createClass({
  render: function() {
    // マークダウンの表示
    // var rawMarkup = marked(this.props.data.html.toString(), {sanitize: true})
    var rawMarkup = this.props.data.html.toString();

    // dangerouslySetInnerHTMLでHTMLをエスケープせずに表示する
    return (
      <div className="wysiwyg-preview" dangerouslySetInnerHTML={{__html: rawMarkup}} />
    )
  }
})

var WysiwygEditor = React.createClass({
  // propTypes: {
  //   onChange: React.PropTypes.func,
  //   name: React.PropTypes.string,
  //   textValue: React.PropTypes.string
  // },
  // getDefaultProps: function() {
  //   return {
  //     textValue: ''
  //   };
  // },
  // getInitialState: function() {
  //   return {
  //     textValue: this.props.textValue
  //   };
  // },
  componentWillMount: function() {
    if (this.ta) {
      return;
    }
    this.ta = document.createElement('textarea');
    this.ta.setAttribute("name", this.props.data.name);
    this.ta.value = this.props.data.html;
    $(this.ta).hide();
  },
  componentDidMount: function() {
    ReactDOM.findDOMNode(this).appendChild(this.ta);

    var child = ReactDOM.findDOMNode(this.refs.editor);
    this.editor = $(child).trumbowyg({
        lang: 'ja',
        svgPath: '/icons.svg',
        removeformatPasted: true,
        autogrow: true,
        btns: [
            ['viewHTML'],
            ['h2'],
            ['bold', 'underline', 'foreColor'],
            ['link'],
            ['image'],
            ['blockquote'],
        ],
    });
    this.editor
      .on('tbwchange', this.handleChange)
      .on('tbwblur', this.handleChange);

    this.editor.trumbowyg('html', this.props.data.html);
  },
  handleChange: function(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    var html = $(ReactDOM.findDOMNode(this.refs.editor)).trumbowyg('html');

    // TODO
    this.props.onEditorChange({
      name: this.props.data.name,
      html: html
    });

//    this.setState({textValue: html});
    this.ta.value = html;
  },
  componentWillReceiveProps: function() {
    this.setState({textValue: this.props.data.html});
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
