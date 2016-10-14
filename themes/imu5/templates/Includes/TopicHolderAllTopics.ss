<h2>All topics:</h2>
<ul class="topic-grid small-block-grid-2 medium-block-grid-3 large-block-grid-4">
  <% loop $AllTags %>
    <% if $BlogPosts %>
    <li class="topic-grid-nav">
      <a href="$Link">$Title</a>
      <div class="content active">
        <ul class="fa-ul"> 
          <% loop $BlogPosts %>
            <li><i class="fa-li fa fa-file-text-o" aria-hidden="true"></i><a href="$Link">$Title</a></li>
          <% end_loop %>
        </ul>

      </div>
    </li>
    <% end_if %>
  <% end_loop %>
</ul>