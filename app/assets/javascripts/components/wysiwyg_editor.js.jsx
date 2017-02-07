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

    var html = '';
    switch (editorNode.type) {
      case 'text':
        html = editorNode.data.html.toString();
        // TODO: 回り込みの解除をどこで行うか
        html += '<div style="clear: both;"></div>';
        break;
      case 'embed_tag':
        html = editorNode.data.html.toString();
        break;
      case 'h2':
        html = editorNode.data.html.toString();
        // TODO: 空の時にプレビューで行が消えて見える
        if (html == '') html = '<br>';

        html = '<h2>' + html + '</h2>';
        break;
      case 'image':
        html = '<figure style="text-align: center;';
        switch (editorNode.data.style) {
          case 'left':
            html += ' float: left;';
            break;
          case 'right':
            html += ' float: right;';
            break;
        };
        html += '">';

        html += '<img src="' + editorNode.data.src.toString() + '" />';
        if (editorNode.data.caption) {
          html += '<figcaption>' + editorNode.data.caption.toString().replace(/\n/g, '<br />') + '</figcaption>'
        }
        html += '</figure>';
        break;
      case 'ul':
        html = '<ul>';
        html += editorNode.data.textList.map(function(text) {
          var tmpHtml = convOutputHTML([text]);
          if (tmpHtml == '') return;
          return '<li>' + tmpHtml + '</li>';
        }).join('');
        html += '</ul>';
        break;
      case 'border':
        var tmpHtml = convOutputHTML(editorNode.data.nodeList);
        if (tmpHtml != '') {
          switch (editorNode.data.style) {
            case 'blockquote':
              html = '<blockquote cite="https://example.com/">';
              html += tmpHtml;
              html += '<div style="clear: both;"></div>';
              html += '</blockquote>';
              break;
            default:
              html = '<div style="border: solid 1px #ddd; padding: 10px; margin: 10px 0;">';
              html += tmpHtml;
              html += '<div style="clear: both;"></div>';
              html += '</div>';
          };
        }
        break;

      default:
        console.log("TODO: convOutputHTML when " + editorNode.type);
    };

    return html;
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

// 新規EdirorNodeの取得
function getNewEdirorNode(key, type) {
  var ret = false;
  switch (type) {
    case 'text':
    case 'h2':
    case 'embed_tag':
      ret = {
        key: key,
        type: type,
        data: {
          html: ''
        }
      };
      break;
    case 'image':
      ret = {
        key: key,
        type: type,
        data: {
          style: 'center',
          src: '',
          caption: ''
        }
      };
      break;
    case 'ul':
      ret = {
        key: key,
        type: type,
        data: {
          textList: [getNewEdirorNode(guid(), 'text')]
        }
      };
      break;
    case 'border':
      ret = {
        key: key,
        type: type,
        data: {
          style: 'border',
          nodeList: [getNewEdirorNode(guid(), '')]
        }
      };
      break;
    default:
      ret = {
        key: key,
        type: type,
        data: {
          html: ''
        }
      };
      console.log("TODO: handleEditorMenuClick when " + type);
  };

  return ret;
};

/*****************************************************************************

  Editor

 *****************************************************************************/
var Editor = React.createClass({

  componentWillMount: function() {
    if (!this.outputHTML) {
      this.outputHTML = document.createElement('textarea');
      this.outputHTML.classList.add('editor-output-html');
      $(this.outputHTML).hide();
    }
    if (!this.outputJSON) {
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
  handleEditorInsert: function(index) {
    var nodeKey = guid();
    var editorNode = getNewEdirorNode(nodeKey, '');
    if (editorNode == false) return;

    this.insertEditorNode(editorNode, index);
  },
  handleEditorChange: function(editorNode) {
    // this.setState({ data: this.state.data.concat([editorNode]) });
    this.updateEditorNode(editorNode);
  },
  handleEditorDelete: function(editorNode) {
    this.deleteEditorNode(editorNode);
  },
  // editorNodeの追加
  insertEditorNode: function(editorNode, index) {
    if (index !== 0 && !index) index = this.state.data.length;

    var newEditorNode = this.state.data.concat();
    newEditorNode.splice( index, 0, editorNode ) ;
    this.setState({ data: newEditorNode });
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
      { key: 'image', text: '画像' },
      { key: 'embed_tag', text: 'タグ' },
      { key: 'ul', text: 'リスト' },
      { key: 'border', text: '枠線' }
    ];
  },
  // Menuクリックイベント
  handleEditorMenuClick: function(nodeKey, nodeType) {
    var editorNode = getNewEdirorNode(nodeKey, nodeType);
    if (editorNode == false) return;

    this.handleEditorChange(editorNode);
  },
  // Outputの情報を最新化
  syncOutput: function() {
    this.outputHTML.value = convOutputHTML(this.state.data);
    this.outputJSON.value = convOutputJSON(this.state.data);
  },
  render: function() {
    this.syncOutput();

    var editorNodes = this.state.data.map(function (editorNode, index) {
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
        case 'image':
          typeNode = (
            <EditorImage
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
        case 'ul':
          typeNode = (
            <EditorList
              key={editorNode.key}
              onEditorChange={this.handleEditorChange}
              data={editorNode}
              />
          );
          break;
        case 'border':
          typeNode = (
            <EditorBorder
              key={editorNode.key}
              onEditorChange={this.handleEditorChange}
              data={editorNode}
              />
          );
          break;

        default:
          // Menuのみ
      };
      return (
        <div key={editorNode.key + ':Editor'}>
          <div style={{border: "solid 1px #ddd", padding: "10px", margin: "10px 0"}}>
            <EditorMenu
              onClick={this.handleEditorMenuClick}
              onDelete={this.handleEditorDelete}
              data={editorNode}
              menu={this.getMenu()}
              />
            {typeNode}
          </div>
          <EditorNodeInsert
            onClick={this.handleEditorInsert}
            index={index + 1}
            />
        </div>
      );
    }.bind(this));

    return (
      <table style={{tableLayout: "fixed", width: "100%"}}>
        <tbody>
          <tr>
            <td style={{width: "50%", verticalAlign: "top"}}>
              <EditorNodeInsert
                onClick={this.handleEditorInsert}
                index={0}
                />
              {editorNodes}
            </td>
            <td style={{
                width: "50%",
                verticalAlign: "top",
                borderLeft: "dashed 1px #dddddd",
                padding: "10px",
                position: "fixed",
                top: "0",
                height: "100%",
                boxSizing: "border-box",
                overflowY: "scroll"
              }}>
              <EditorPreview data={this.state.data} />
            </td>
          </tr>
        </tbody>
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
    this.props.onClick(this.props.data.key, e.currentTarget.value);
  },
  handleDelete: function(e) {
    e.preventDefault();
    this.props.onDelete(this.props.data);
  },
  render: function() {
    var menuNodes = this.props.menu.map(function (v, index) {
      return (
        <li key={this.props.data.key + ':EditorMenu:' + index} style={{display: "inline-block"}}>
          <button type="button" onClick={this.handleOnClick} value={v.key}>
            {v.text}
          </button>
        </li>
      );
    }.bind(this));

    menuNodes = menuNodes.concat((
      <li key={this.props.data.key + ':EditorMenu:delete'} style={{display: "inline-block", float: "right"}}>
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

  EditorNodeInsert

 *****************************************************************************/
var EditorNodeInsert = React.createClass({
  handleOnClick: function(e) {
    e.preventDefault();
    this.props.onClick(this.props.index);
  },
  render: function() {
    return (
      <button type="button" onClick={this.handleOnClick}>追加</button>
    );
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

    var editorNode = $.extend(true, {}, this.props.data);
    editorNode.data.html = h2;
    this.props.onEditorChange(editorNode);
  },
  render: function() {
    return (
      <div>
        <span style={{fontSize: "12px"}}>見出し:</span><br />
        <input type="text" ref="h2"
          onChange={this.handleChange}
          value={this.props.data.data.html}
          style={{width: "100%", boxSizing: "border-box"}}
          />
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
            ['bold', 'underline', 'foreColor'],
            ['link'],
            ['image'],
        ],
    });
    this.editor.on('tbwchange', this.handleChange);

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
        <span style={{fontSize: "12px"}}>本文:</span><br />
        <div ref="editor" />
      </div>
    );
  }
});

/*****************************************************************************

  画像

 *****************************************************************************/
var EditorImage = React.createClass({
  handleChangeStyle: function (e) {
    var newEditorNode = $.extend(true, {}, this.props.data);
    newEditorNode.data.style = e.currentTarget.value;
    this.props.onEditorChange(newEditorNode);
  },
  handleChange: function(e) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }

    var editorNode = $.extend(true, {}, this.props.data);

    var imageFiles = ReactDOM.findDOMNode(this.refs.image).files;
    if (imageFiles.length > 0) {
      editorNode.data.src = window.URL.createObjectURL(imageFiles[0]);
    }

    var caption = ReactDOM.findDOMNode(this.refs.caption).value;
    editorNode.data.caption = caption;

    this.props.onEditorChange(editorNode);
  },
  render: function() {
    return (
      <div>
        <span style={{fontSize: "12px"}}>画像:</span><br />
        <img src={this.props.data.data.src} />
        <input type="file" ref="image"
          onChange={this.handleChange}
          style={{width: "100%", boxSizing: "border-box"}}
          />
        <span style={{fontSize: "12px"}}>
          レイアウト:
          <label>
            <input type="radio"
              value="left"
              checked={this.props.data.data.style === 'left'}
              onChange={this.handleChangeStyle}
              />
            左寄せ
          </label>
          <label>
            <input type="radio"
              value="center"
              checked={this.props.data.data.style === 'center'}
              onChange={this.handleChangeStyle}
              />
            中央寄せ
          </label>
          <label>
            <input type="radio"
              value="right"
              checked={this.props.data.data.style === 'right'}
              onChange={this.handleChangeStyle}
              />
            右寄せ
          </label>
        </span><br />
        <span style={{fontSize: "12px"}}>キャプション:</span><br />
        <textarea ref="caption"
          onChange={this.handleChange}
          value={this.props.data.data.caption}
          style={{border: "solid 1px #ddd", width: "100%", marginWidth: "100%"}}
          />
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
        <span style={{fontSize: "12px"}}>埋め込みタグ:</span><br />
        <input type="text" ref="embed_tag" onChange={this.handleChange} value={this.props.data.data.html} style={{width: "100%", boxSizing: "border-box"}} />
      </div>
    );
  }
});

/*****************************************************************************

  リスト

 *****************************************************************************/
var EditorList = React.createClass({
  handleChange: function(editorNode) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }

    var editorNodeIndex = false;
    this.props.data.data.textList.some(function (node, index) {
      if (node.key == editorNode.key) {
        editorNodeIndex = index;
        return true;
      }
    }, editorNode);

    var newEditorNode = $.extend(true, {}, this.props.data);
    if (editorNodeIndex === false) {
      newEditorNode.data.textList.push(editorNode);
    } else {
      newEditorNode.data.textList[editorNodeIndex] = editorNode;
    };

    if (newEditorNode.data.textList.length == 0 || newEditorNode.data.textList[newEditorNode.data.textList.length - 1].data.html != '') {
      newEditorNode.data.textList.push(getNewEdirorNode(guid(), 'text'));
    }

    this.props.onEditorChange(newEditorNode);
  },
  render: function() {
    var typeNodes = this.props.data.data.textList.map(function(text) {
      var editorNode = getNewEdirorNode(text.key, 'text');
      editorNode.data.html = text.data.html;
      return (
        <WysiwygEditor
          key={editorNode.key}
          onEditorChange={this.handleChange}
          data={editorNode}
          />
      );
    }.bind(this));

    return (
      <div>
        <span style={{fontSize: "12px"}}>リスト:</span><br />
        {typeNodes}
      </div>
    );
  }
});

/*****************************************************************************

  枠線

 *****************************************************************************/
var EditorBorder = React.createClass({
  // Menu
  getMenu: function() {
    return [
      { key: 'text', text: '本文' },
      { key: 'image', text: '画像' },
      { key: 'embed_tag', text: 'タグ' },
      { key: 'ul', text: 'リスト' },
    ];
  },
  // Menuクリックイベント
  handleEditorMenuClick: function(nodeKey, nodeType) {
    var editorNode = getNewEdirorNode(nodeKey, nodeType);
    if (editorNode == false) return;

    this.updateEditorNode(editorNode);
  },
  handleEditorInsert: function(index) {
    var nodeKey = guid();
    var editorNode = getNewEdirorNode(nodeKey, '');
    if (editorNode == false) return;

    this.insertEditorNode(editorNode, index);
  },
  handleChangeStyle: function (e) {
    var newEditorNode = $.extend(true, {}, this.props.data);
    newEditorNode.data.style = e.currentTarget.value;
    this.props.onEditorChange(newEditorNode);
  },
  handleChange: function(editorNode) {
    this.updateEditorNode(editorNode);
  },
  handleEditorDelete: function(editorNode) {
    this.deleteEditorNode(editorNode);
  },
  insertEditorNode: function(editorNode, index) {
    var newEditorNode = $.extend(true, {}, this.props.data);

    if (index !== 0 && !index) index = newEditorNode.data.nodeList.length;

    newEditorNode.data.nodeList.splice( index, 0, editorNode ) ;
    this.props.onEditorChange(newEditorNode);
  },
  updateEditorNode: function(editorNode) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }

    var editorNodeIndex = this.getIndexEditorNode(editorNode);

    var newEditorNode = $.extend(true, {}, this.props.data);
    if (editorNodeIndex === false) {
      newEditorNode.data.nodeList.push(editorNode);
    } else {
      newEditorNode.data.nodeList[editorNodeIndex] = editorNode;
    };

    this.props.onEditorChange(newEditorNode);
  },
  // editorNodeの削除
  deleteEditorNode: function(editorNode) {
    var editorNodeIndex = this.getIndexEditorNode(editorNode);

    var newEditorNode = $.extend(true, {}, this.props.data);
    newEditorNode.data.nodeList.splice(editorNodeIndex, 1);

    this.props.onEditorChange(newEditorNode);
  },
  // editorNodeのindexを取得
  getIndexEditorNode: function(editorNode) {
    var ret = false;
    this.props.data.data.nodeList.some(function (node, index) {
      if (node.key == editorNode.key) {
        ret = index;
        return true;
      }
    }, editorNode);

    return ret;
  },
  render: function() {
    var editorNodes = this.props.data.data.nodeList.map(function (editorNode, index) {
      var typeNode = null;
      switch (editorNode.type) {
        case 'text':
          typeNode = (
            <WysiwygEditor
              key={editorNode.key}
              onEditorChange={this.handleChange}
              data={editorNode}
              />
          );
          break;
        case 'image':
          typeNode = (
            <EditorImage
              key={editorNode.key}
              onEditorChange={this.handleChange}
              data={editorNode}
              />
          );
          break;
        case 'embed_tag':
          typeNode = (
            <EditorEmbedTag
              key={editorNode.key}
              onEditorChange={this.handleChange}
              data={editorNode}
              />
          );
          break;
        case 'ul':
          typeNode = (
            <EditorList
              key={editorNode.key}
              onEditorChange={this.handleChange}
              data={editorNode}
              />
          );
          break;

        default:
          // Menuのみ
      };
      return (
        <div key={editorNode.key + ':EditorBorder'}>
          <div style={{border: "solid 1px #ddd", padding: "10px", margin: "10px 0"}}>
            <EditorMenu
              onClick={this.handleEditorMenuClick}
              onDelete={this.handleEditorDelete}
              data={editorNode}
              menu={this.getMenu()}
              />
            {typeNode}
          </div>
          <EditorNodeInsert
            onClick={this.handleEditorInsert}
            index={index + 1}
            />
        </div>
      );
    }.bind(this));

    return (
      <div>
        <span style={{fontSize: "12px"}}>枠線:</span><br />
        <span style={{fontSize: "12px"}}>
          レイアウト:
          <label>
            <input type="radio"
              value="border"
              checked={this.props.data.data.style === 'border'}
              onChange={this.handleChangeStyle}
              />
            枠線
          </label>
          <label>
            <input type="radio"
              value="blockquote"
              checked={this.props.data.data.style === 'blockquote'}
              onChange={this.handleChangeStyle}
              />
            引用
          </label>
        </span><br />
        <EditorNodeInsert
          onClick={this.handleEditorInsert}
          index={0}
          />
        {editorNodes}
      </div>
    );
  }
});
