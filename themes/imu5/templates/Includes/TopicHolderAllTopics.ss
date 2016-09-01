<h2>All topics:</h2>
<ul class="accordion small-block-grid-2 medium-block-grid-3 large-block-grid-5" data-accordion role="tablist" <% if $SelectedTag %>data-highlight="$CurrentTag.ID"<% end_if %>>
  <% loop $AllTags %>
  <% if $BlogPosts %>
  <li class="accordion-navigation">
    <a href="#panel{$ID}d" role="tab" id="panel{$ID}d-heading" aria-controls="panel{$ID}d">$Title <i class="fa fa-caret-down fa-sm"></i></a>
    <div id="panel{$ID}d" class="content <% if $Up.ExpandAllTopicsByDefault %>active<% end_if %>" role="tabpanel" aria-labelledby="panel{$ID}d-heading">
      <ul class="fa-ul"> 
        <% loop $BlogPosts %>
          <li><i class="fa-li fa fa-file-text-o"></i><a href="$Link">$Title</a></li>
        <% end_loop %>
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