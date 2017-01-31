function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var Editor = React.createClass({
  getInitialState: function() {
    return {
      data: []
    };
  },
  componentDidMount: function() {
    this.setState({ data: [
      {
        key: guid(),
        type: '',
        data: {
          name: guid(),
          html: '<p>hoge</p>'
        }
      },
      {
        key: guid(),
        type: '',
        data: {
          name: guid(),
          html: '<p>hoge</p>'
        }
      }
    ] })
  },
  handleEditorChange: function(editorNode) {
    // this.setState({ data: this.state.data.concat([editorNode]) });
    var editorNodes = this.state.data.map(function (node) {
      if (node.key == editorNode.key) {
        return editorNode;
      } else {
        return node;
      }
    }, editorNode)
    this.setState({ data: editorNodes });
  },
  render: function() {
    var editorNodes = this.state.data.map(function (editorNode) {
      return (
        <WysiwygEditor key={editorNode.key} onEditorChange={this.handleEditorChange} data={editorNode} />
      );
    }.bind(this));

    return (
      <table style={{tableLayout: "fixed", width: "100%"}}>
        <tr>
          <td style={{width: "50%", verticalAlign: "top"}}>
            {editorNodes}
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
    var innertHtml = this.props.data.map(function (editorNode) {
      return editorNode.data.html.toString();
    }).join('')

    // dangerouslySetInnerHTMLでHTMLをエスケープせずに表示する
    return (
      <div className="wysiwyg-preview" dangerouslySetInnerHTML={{__html: innertHtml}} />
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
    this.ta.setAttribute("name", this.props.data.data.name);
    this.ta.value = this.props.data.data.html;
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

    this.editor.trumbowyg('html', this.props.data.data.html);
  },
  handleChange: function(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    var html = $(ReactDOM.findDOMNode(this.refs.editor)).trumbowyg('html');

    var editorNode = $.extend(true, {}, this.props.data);
    editorNode.data.html = html;
    this.props.onEditorChange(editorNode);

//    this.setState({textValue: html});
    this.ta.value = html;
  },
  componentWillReceiveProps: function() {
    this.setState({textValue: this.props.data.data.html});
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
