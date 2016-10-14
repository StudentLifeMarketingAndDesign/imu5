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

        <% if $Tags %>
  
          <p class="tags">
                Tagged as:
              <% loop Tags %>
                  <a href="$Link" title="<% _t('VIEWALLPOSTTAGGED', 'View all posts tagged') %> '$Title'" rel="tag">$Title</a><% if not Last %>,<% end_if %>
              <% end_loop %>
          </p>
        <% end_if %>
    
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
            <% include TopicHolderFeaturedTopics %>
          <% end_with %>
          <% include TopicHolderAllTopics %>


    </div>
  </div>
</div>



