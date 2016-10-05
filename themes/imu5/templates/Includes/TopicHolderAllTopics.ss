<h2>All topics:</h2>
<ul class="topic-grid small-block-grid-2 medium-block-grid-3 large-block-grid-5">
  <% loop $AllTags %>
  <% if $BlogPosts %>
  <li class="topic-grid-nav">
    <a href="$Link">$Title</a>
    <div class="content active">
      <ul class="fa-ul"> 
        <% loop $BlogPosts.Limit(5) %>
          <li><i class="fa-li fa fa-file-text-o" aria-hidden="true"></i><a href="$Link">$Title</a></li>
          
        <% end_loop %>
        <% if $BlogPosts.Count > 5 %><li><i class="fa-li fa fa-ellipsis-h" aria-hidden="true"></i><a href="$Link">More &rarr;</a></li><% end_if %>
      </ul>
<%--               <% if $BlogPosts.Count > 1 %><p>Jump to: <% loop $BlogPosts %><a href="#topic-{$ID}">$Title</a><% if not $Last%>, <% end_if %><% end_loop %></p><hr /><% end_if %>
      <% loop $BlogPosts %>
        <div class="topic" id="topic-{$ID}">
        <h2>$Title</h2>
        $Content
        </div>
        <% if not $Last %>
          <hr />
        <% end_if %>
      <% end_loop %> --%>
    </div>
  </li>
  <% end_if %>
  <% end_loop %>
</ul>