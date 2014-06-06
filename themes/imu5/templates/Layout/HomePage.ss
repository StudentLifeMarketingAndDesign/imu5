<style>
.hero {
  border-bottom: 5px solid #ffce39;
  position: relative;
  padding: 2em 0;
  background-color: #FFF;
}
@media screen and (min-width: 480px) and (max-width: 768px) {
  .hero {
  <% if $BackgroundFeature %>
    background: black url({$BackgroundFeature.Image.URL}) no-repeat center top;
  <% else %>
    background: black url({$ThemeDir}/images/hero-image-md.jpg) no-repeat center top;
  <% end_if %>
    padding: 4em 0;
  }
}
@media screen and (min-width: 768px) {
  .hero {
  <% if $BackgroundFeature %>
    background: black url({$BackgroundFeature.Image.URL}) no-repeat center top;
  <% else %>
    background: black url({$ThemeDir}/images/hero-image.jpg) no-repeat center top;
  <% end_if %>
    padding: 0;
    height: 665px;
  }
}
</style>
<div class="hero">
        <div class="container clearfix">
          <% if HomePageHeroFeatures.Limit(2) %>
              <div class="hero-article-wrapper">
                <% loop HomePageHeroFeatures.Limit(2) %>
                  <% include HomePageHeroFeature %>
                <% end_loop %>
  	          </div>
           <% end_if %>
           <% include HomePageHeroText %>
        </div>
    </div>
	<section class="home-highlights">
        <div class="container clearfix">
	        <% loop HomePageFeatures %>
	        	<% include HomePageFeature %>
	        <% end_loop %>
	        
		    <div class="module"> 
			    <div class="inner">
			    	<% loop AfterClassEvents.Limit(4) %>
			        <h3><a href='$link'> $Title </a></h3>
			        <p>Coming Up On: $NextDateTime.NiceUS() </p>     	
					<% end_loop %>
			    </div>
			</div>  
			
			<div class="module">
			    <div class="inner">
			    	<a class="twitter-timeline"  href="https://twitter.com/imubuddy"  data-widget-id="472118990869762048">Tweets by @imubuddy</a>
    <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
			    </div>
			</div>
	       
        </div><!-- end .container -->
    </section>

    <% include TopicsAndNews %>
