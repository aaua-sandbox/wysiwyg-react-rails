var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    console.log('--- loadCommentsFromServer ---');
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(result) {
        this.setState({data: result.data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    console.log('--- componentDidMount ---');
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    console.log('--- render ---');
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    console.log(this.props);
    console.log(this.props.data);
    var commentNodes = this.props.data.map(function (comment) {
      return (
        <Comment author={comment.author}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
})

var CommentForm = React.createClass({
  render: function() {
    return (
      <div className="commentForm">
        Hello, world! Iam a CommentForm.
      </div>
    )
  }
})

var Comment = React.createClass({
  render: function() {
    // HTMLをエスケープせずに表示する
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true})
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    )
  }
})
