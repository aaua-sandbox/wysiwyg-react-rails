function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


/*****************************************************************************

  Editor共通

 *****************************************************************************/
// 出力用HTMLに変換
function convOutputHTML(data) {
  return data.map(function (editorNode) {
    return editorNode.data.html.toString();
  }).join('');
};

// 出力用JSONに変換
function convOutputJSON(data) {
  return JSON.stringify(data);
};

// debug用出力
function p() {
  console.log('----- Editor output -----');
  console.log($(".editor-output-html").val());
  console.log(JSON.stringify(JSON.parse($(".editor-output-json").val()), null, '\t'));
  console.log('-------------------------');
}

/*****************************************************************************

  Editor

 *****************************************************************************/
var Editor = React.createClass({
  componentWillMount: function() {
    if (this.outputHTML) {
      return;
    } else {
      this.outputHTML = document.createElement('textarea');
      this.outputHTML.classList.add('editor-output-html');
      $(this.outputHTML).hide();
    }
    if (this.outputJSON) {
      return;
    } else {
      this.outputJSON = document.createElement('textarea');
      this.outputJSON.classList.add('editor-output-json');
      $(this.outputJSON).hide();
    }
  },
  getInitialState: function() {
    return {
      data: [
        {
          key: guid(),
          type: '',
          data: {
            html: ''
          }
        }
      ]
    };
  },
  componentDidMount: function() {
    ReactDOM.findDOMNode(this).appendChild(this.outputHTML);
    ReactDOM.findDOMNode(this).appendChild(this.outputJSON);

    // TODO: Data Load
    // this.setState({ data: [
    //   {
    //     key: guid(),
    //     type: '',
    //     data: {
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
      case 'text':
      case 'h2':
      case 'embed_tag':
        ret = {
          key: guid(),
          type: key,
          data: {
            html: ''
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
      { key: 'text', text: '本文' },
      { key: 'img', text: '画像' },
      { key: 'embed_tag', text: 'タグ' },
      { key: 'ul', text: 'リスト' },
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
  // Outputの情報を最新化
  syncOutput: function() {
    this.outputHTML.value = convOutputHTML(this.state.data);
    this.outputJSON.value = convOutputJSON(this.state.data);
  },
  render: function() {
    this.syncOutput();

    var editorNodes = this.state.data.map(function (editorNode) {
      var typeNode = null;
      switch (editorNode.type) {
        case 'text':
          typeNode = (
            <WysiwygEditor
              key={editorNode.key}
              onEditorChange={this.handleEditorChange}
              data={editorNode}
              />
          );
          break;
        case 'h2':
          typeNode = (
            <EditorH2
              key={editorNode.key}
              onEditorChange={this.handleEditorChange}
              data={editorNode}
              />
          );
          break;
        case 'embed_tag':
          typeNode = (
            <EditorEmbedTag
              key={editorNode.key}
              onEditorChange={this.handleEditorChange}
              data={editorNode}
              />
          );
          break;

        default:
          console.log("TODO: Editor render when " + editorNode.key);
      };
      return (
        <div style={{border: "solid 1px #ddd", padding: "10px", margin: "10px 0"}}>
          <EditorMenu
            onClick={this.handleEditorMenuClick}
            onDelete={this.handleEditorDelete}
            data={editorNode}
            menu={this.getMenu()}
            />
          {typeNode}
        </div>
      );
    }.bind(this));

    return (
      <table style={{tableLayout: "fixed", width: "100%"}}>
        <tr>
          <td style={{width: "50%", verticalAlign: "top"}}>
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

/*****************************************************************************

  Preview

 *****************************************************************************/
var EditorPreview = React.createClass({
  componentDidUpdate: function() {
//     // TODO: タグ埋め込みのプレビュー表示をどのようにするか
//     var x = convOutputHTML(this.props.data);
//     console.log(x);
//     var script=/<script\s(.+)<\/script>/gi.exec(x);
//
//     console.log(script);
//     // window.eval(extractscript[1]);
//
//     var ele = document.createElement('span');
//     ele.innerHTML = script[0];
//
//     var preview = ReactDOM.findDOMNode(this.refs.preview);
//     preview.appendChild(ele);
//
// //    window.eval('<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>');

    var preview = ReactDOM.findDOMNode(this.refs.preview);

    var scriptTwitter = document.createElement("script");
    scriptTwitter.setAttribute("src","//platform.twitter.com/widgets.js");
    scriptTwitter.setAttribute("charset","utf-8");
    scriptTwitter.async = true;
    preview.appendChild(scriptTwitter);

    // TODO: 動作しない
    var scriptPinterest = document.createElement("script");
    scriptPinterest.setAttribute("src","//assets.pinterest.com/js/pinit.js");
    scriptPinterest.async = true;
    scriptPinterest.defer = true;
    preview.appendChild(scriptPinterest);
  },
  render: function() {
    // マークダウンの表示
    // var rawMarkup = marked(this.props.data.html.toString(), {sanitize: true})
    var innertHtml = convOutputHTML(this.props.data);

    // dangerouslySetInnerHTMLでHTMLをエスケープせずに表示する
    return (
      <div ref="preview">
        <div className="wysiwyg-preview" dangerouslySetInnerHTML={{__html: innertHtml}} />
      </div>
    )
  }
});

/*****************************************************************************

  Menu

 *****************************************************************************/
var EditorMenu = React.createClass({
  handleOnClick: function(e) {
    e.preventDefault();
    this.props.onClick(e.currentTarget.value);
  },
  handleDelete: function(e) {
    e.preventDefault();
    this.props.onDelete(this.props.data);
  },
  render: function() {
    var menuNodes = this.props.menu.map(function (v) {
      return (
        <li style={{display: "inline-block"}}>
          <button type="button" onClick={this.handleOnClick} value={v.key}>
            {v.text}
          </button>
        </li>
      );
    }.bind(this));

    menuNodes = menuNodes.concat((
      <li style={{display: "inline-block", float: "right"}}>
        <button type="button" onClick={this.handleDelete} style={{fontWeight: "bold", border: "solid 1px #ddd", backgroundColor: "white"}}>×</button>
      </li>
    ));

    return (
      <ul style={{margin: 0, padding: 0}}>
        {menuNodes}
      </ul>
    )
  }
});

/*****************************************************************************

  本文

 *****************************************************************************/
var EditorH2 = React.createClass({
  handleChange: function(e) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }

    var h2 = ReactDOM.findDOMNode(this.refs.h2).value.trim();

    // TODO: 空の時にプレビューで行が消えて見える
    if (h2 == '') h2 = '<br>';

    var editorNode = $.extend(true, {}, this.props.data);
    editorNode.data.html = '<h2>' + h2 + '</h2>';
    this.props.onEditorChange(editorNode);
  },
  render: function() {
    var text = $('<div>').html(this.props.data.data.html).text();

    return (
      <div>
        <h3>見出し</h3>
        <input type="text" ref="h2" onChange={this.handleChange} value={text} style={{width: "100%", boxSizing: "border-box"}} />
      </div>
    );
  }
});

/*****************************************************************************

  本文

 *****************************************************************************/
var WysiwygEditor = React.createClass({
  componentDidMount: function() {
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
  },
  componentWillUnMount: function () {
    $(this.editor).off();
    this.editor = null;
  },
  render: function() {
    return (
      <div>
        <h3>本文</h3>
        <div ref="editor" />
      </div>
    );
  }
});

/*****************************************************************************

  埋め込みタグ

 *****************************************************************************/
var EditorEmbedTag = React.createClass({
  handleChange: function(e) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }

    var embed_tag = ReactDOM.findDOMNode(this.refs.embed_tag).value.trim();

    var editorNode = $.extend(true, {}, this.props.data);
    editorNode.data.html = embed_tag;
    this.props.onEditorChange(editorNode);
  },
  render: function() {
    return (
      <div>
        <h3>埋め込みタグ</h3>
        <input type="text" ref="embed_tag" onChange={this.handleChange} value={this.props.data.data.html} style={{width: "100%", boxSizing: "border-box"}} />
      </div>
    );
  }
});
