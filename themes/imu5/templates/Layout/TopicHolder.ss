
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
        $Content
        $Form


        <ul class="accordion" data-accordion role="tablist">
          <li class="accordion-navigation">
            <a href="#panel1d" role="tab" id="panel1d-heading" aria-controls="panel1d">Accordion 1</a>
            <div id="panel1d" class="content active" role="tabpanel" aria-labelledby="panel1d-heading">
            </div>
          </li>
        </ul>
        
        <% if $Tags %>
        1
        <% loop $Tags %>
        2
          <li><a href="$Link">$Title <span class="count">($BlogPosts.Count)</span></a></li>&nbsp;
      <% end_loop %>
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

