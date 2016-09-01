
<% if $BackgroundImage %>
<div class="img-container" style="background-image: url($BackgroundImage.URL);">
  <div class="img-fifty-top"></div>
</div>
<% end_if %>
<div class="gradient">
  <div class="page-full-width">
    <div class="container clearfix">
      <div class="white-cover"></div>
      <section class="main-content <% if $BackgroundImage %>margin-top<% end_if %>">
        $Breadcrumbs
        <h1>$Title</h1>
        $Content


        <% if $CurrentTag %>
  
            <% with $CurrentTag %>
              <h2>Topics tagged with "<em>$Title</em>":</h2>
                <ul class="large-block-grid-2">
                <% loop $BlogPosts %>
                  <li>
                    <h3><i class="fa fa-file-text-o fa-lg fa-fw"></i><a href="$Link">$Title</a></h3>
                    <p>$Content.LimitCharacters(100)</p>
                  </li>
                <% end_loop %>
                </ul>
            <% end_with %>
            

          <hr />

        <% else %>


        <% end_if %>




        <% include TopicHolderSearchForm %>
        <hr />
          <h2>Featured topics:</h2>
            <ul class="large-block-grid-3">
            <% loop $BlogPosts.Sort('RAND()').Limit(3) %>
              <li>
                <h3><i class="fa fa-file-text-o fa-lg fa-fw"></i><a href="$Link">$Title</a></h3>
                <p>$Content.LimitCharacters(100)</p>
              </li>
            <% end_loop %>
            </ul>
        <hr />
        <% include TopicHolderAllTopics %>
    

        <% if getSidebarItems %>
          <% loop getSidebarItems %>
            <% include SidebarItem %>
          <% end_loop %>
        <% end_if %>

      </section>
    </div>
  </div>
</div>
<% include TopicsAndNews %>
