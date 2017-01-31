function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

/********************************************

  Editor

 ********************************************/
var Editor = React.createClass({
  getInitialState: function() {
    return {
      data: []
    };
  },
  componentDidMount: function() {
    // TODO: Data Load
    // this.setState({ data: [
    //   {
    //     key: guid(),
    //     type: '',
    //     data: {
    //       name: guid(),
    //       html: '<p>Editor1</p>'
    //     }
    //   }
    // ] });
  },
  handleEditorInsert: function(editorNode) {
    this.insertEditorNode(editorNode)
  },
  handleEditorChange: function(editorNode) {
    // this.setState({ data: this.state.data.concat([editorNode]) });
    this.updateEditorNode(editorNode);
  },
  handleEditorDelete: function(editorNode) {
    this.deleteEditorNode(editorNode);
  },
  getNewEdirorNode: function(key) {
    var ret = false;
    switch (key) {
      case 'document':
        ret = {
          key: guid(),
          type: key,
          data: {
            name: guid(),
            html: '<p>EditorAdd</p>'
          }
        };

        break;
      default:
        console.log("TODO: handleEditorMenuClick when " + key);
    };

    return ret;
  },
  // editorNodeの追加
  insertEditorNode: function(editorNode) {
    // TODO: 追加位置を指定可能にする
    this.setState({ data: this.state.data.concat([editorNode]) });
  },
  // editorNodeの更新
  updateEditorNode: function(editorNode) {
    var indexNode = this.getIndexEditorNode(editorNode);

    var editorNodes = this.state.data.concat();
    editorNodes[indexNode] = editorNode;

    this.setState({ data: editorNodes });
  },
  // editorNodeの削除
  deleteEditorNode: function(editorNode) {
    var indexNode = this.getIndexEditorNode(editorNode);

    var editorNodes = this.state.data.concat();
    editorNodes.splice(indexNode, 1);

    this.setState({ data: editorNodes });
  },
  // editorNodeのindexを取得
  getIndexEditorNode: function(editorNode) {
    var ret = false;
    this.state.data.some(function (node, index) {
      if (node.key == editorNode.key) {
        ret = index;
        return true;
      }
    }, editorNode);

    return ret;
  },
  // Menu
  getMenu: function() {
    return [
      { key: 'h2', text: '見出し' },
      { key: 'document', text: '本文' },
      { key: 'image', text: '画像' },
      { key: 'tag', text: 'タグ' },
      { key: 'list', text: 'リスト' },
      { key: 'border', text: '枠線' },
      { key: 'article_link', text: '記事リンク' }
    ];
  },
  // Menuクリックイベント
  handleEditorMenuClick: function(menuKey) {
    var editorNode = this.getNewEdirorNode(menuKey);
    if (editorNode == false) return;

    this.handleEditorInsert(editorNode);
  },
  render: function() {
    var editorNodes = this.state.data.map(function (editorNode) {
      switch (editorNode.type) {
        case 'document':
          return (
            <WysiwygEditor
              key={editorNode.key}
              onEditorChange={this.handleEditorChange}
              onDelete={this.handleEditorDelete}
              data={editorNode}
              />
          );

          break;
        default:
          console.log("TODO: Editor render when " + editorNode.key);
      };
    }.bind(this));

    return (
      <table style={{tableLayout: "fixed", width: "100%"}}>
        <tr>
          <td style={{width: "50%", verticalAlign: "top"}}>
            <EditorMenu
              onClick={this.handleEditorMenuClick}
              data={this.getMenu()}
              />
            {editorNodes}
          </td>
          <td style={{width: "50%", verticalAlign: "top", border: "solid 1px #dddddd", borderRadius: "4px", padding: "10px"}}>
            <EditorPreview data={this.state.data} />
          </td>
        </tr>
      </table>
    );
  }
});

/********************************************

  Preview

 ********************************************/
var EditorPreview = React.createClass({
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
});

/********************************************

  Menu

 ********************************************/
var EditorMenu = React.createClass({
  handleOnClick: function(e) {
    e.preventDefault();
    this.props.onClick(e.currentTarget.value);
  },
  render: function() {
    var menuNodes = this.props.data.map(function (v) {
      return (
        <li style={{display: "inline-block"}}>
          <button type="button" onClick={this.handleOnClick} value={v.key}>
            {v.text}
          </button>
        </li>
      );
    }.bind(this));

    return (
      <ul style={{margin: 0, padding: 0}}>
        {menuNodes}
      </ul>
    )
  }
});

/********************************************

  本文

 ********************************************/
var WysiwygEditor = React.createClass({
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
  handleChange: function(e) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }
    var html = $(ReactDOM.findDOMNode(this.refs.editor)).trumbowyg('html');

    var editorNode = $.extend(true, {}, this.props.data);
    editorNode.data.html = html;
    this.props.onEditorChange(editorNode);

    this.ta.value = html;
  },
  handleDelete: function(e) {
    e.preventDefault();
    this.props.onDelete(this.props.data);
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
      <div>
        <hr />
        <button type="button" onClick={this.handleDelete}>削除</button>
        <div ref="editor" />
      </div>
    );
  }
});
