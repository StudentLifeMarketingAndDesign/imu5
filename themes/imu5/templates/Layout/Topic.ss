<% include BackgroundImage %>
<div class="gradient">
  <div class="container clearfix">
    <div class="white-cover" role="presentation"></div>
      <article class="main-content <% if $BackgroundImage %>margin-top<% end_if %>" id="main-content">
        <% if $FeaturedImage %>
          <img src="<% include PlaceholderLargeSrc %>" data-src="$FeaturedImage.ScaleWidth(820).URL" alt="" role="presentational" />
        <% end_if %>
        $Breadcrumbs
        <h1>$Title</h1>
        $Content
        $Form
      </article>
      <section class="sec-content hide-print">
        <% include SideNav %>
      </section>
  </div>
</div>
<div class="topic-subnav">
  <div class="row">
    <div class="large-12 large-centered columns">
          <% include TopicHolderSearchForm %>
          <hr />

          <% with $Parent %>
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
          <% end_with %>
          <% include TopicHolderAllTopics %>

    </div>
  </div>
</div>



