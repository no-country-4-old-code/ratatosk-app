# Ratatosk
A progressive app for monitoring and analysing cryptocurrencies.
The startup closed 2025.
The sources are outdated but open source.

## The idea
The app allows you to create your own crypto crawlers to search the cryptocurrency market.
Each search task (scan) can be highly customized, for example: “Show me all cryptocurrencies that are below their 4-week average but have a Reddit score above 70.”

The app also notifies you whenever one of your crypto crawlers finds a match by sending a push notification (similar to WhatsApp).
Your crawlers run on servers 24/7, searching for trading opportunities that match your filters.

## Structure
- **backend**
  - **schedule**  
    Handles load-balanced user registration. It assigns new users to the most suitable database, based solely on the *least filled* database. There is no logic related to distance or latency.
  - **user**  
    Contains everything required to run the user crawler over all selected cryptocurrencies, update user status, and send notifications.
  - **shared lib backend**  
    Contains interface definitions for the Firestore database that are used exclusively by the backend.

- **shared lib**
  - Contains a large set of interfaces used by both the backend and the frontend
  - Contains stateless helper/support functions
  - Contains the logic for scanning cryptocurrencies. This logic is used by the backend crawler as well as by the frontend on demand.

- **frontend**
  - Built with Angular and extensive use of Material Design components
  - While I like the overall concept of the Angular framework, I deliberately deviated from some common practices:
    - I moved a lot of stateless logic outside of services.
    - I stopped testing the rendered UI because unit tests were slow and unstable. Instead, I tested the outputs/streams of components directly, which significantly improved the feedback loop. Manual UI checks then took about five additional minutes per pull request.
    - I definitely created some RxJS pipeline monsters.
- **media**
  - I added this one to store some screenshots from the app.

## Health Status
**Tottaly out-dated.** I stopped working on this project some time ago.
I added it to this repository because people asked to take a look at it.
The original Git history (including all personal information) has been removed to avoid being “truffle hogged”.

## Impressions
<p float="left">
  <img src="/media/screen_title_720x1080.png" width="300" />
  <img src="/media/snapshot_build_mobile_480x800.png" width="300" />
  <img src="/media/snapshot_chart_mobile_480x800.png" width="300" />
    <img src="/media/snapshot_conditons2_mobile_480x800.png" width="300" />
    <img src="/media/snapshot_main_mobile_480x800.png" width="300" />
        <img src="/media/snapshot_observed_mobile_480x800.png" width="300" />
    
  
</p>

## Why did it fail?
After two years of work, the app was running smoothly. It was accessible via the web and could also be downloaded as a mobile app from the Google Play Store and the Apple App Store.
I founded a legal entity (GmbH) and waited for customers who never came.

One possible reason is that hardly anyone knew the app even existed. I could not promote it via Google & Co. because ads related to crypto were banned. I could not effectively promote it on social media either, as those platforms were already flooded with crypto-related content. Of course, I still tried: making videos, joining groups, participating in app development competitions, and more.

In addition to that, the app may simply have been too complex or not well aligned with actual market needs. I developed it largely based on my own assumptions of what would be useful, which may have been disconnected from real-world demand. Without users, however, it is very difficult to get meaningful feedback.

### Learnings

Before investing significant time or money into a project like this, I strongly recommend testing your hypotheses through cheap and fast real-world experiments.

For example:
- How can I verify that I can actually reach my customers?
- How can I ensure there is real demand for my idea?
- Are people willing to pay for it?

So instead of *“writing down a good-sounding answer”*, go out there and test it in reality with real results.
Of course, you cannot sell what you do not yet have. But you are a smart, creative fellow, aren’t you? You will find a way around it ;).
I would strongly recommend not even starting to implement your idea as long as you do not have a proven way of selling it.
Cheerio
