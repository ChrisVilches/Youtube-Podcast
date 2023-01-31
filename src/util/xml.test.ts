import { TranscriptionEntry } from '../models/transcription-entry'
import { validateXml, xmlTranscriptionToJson } from './xml'

const invalidXml = `
<!DOCTYPE html>
<html lang=en>
  <meta charset=utf-8>
  <meta name=viewport content="initial-scale=1, minimum-scale=1, width=device-width">
  <title>Error 404 (Not Found)!!1</title>
  <style>
    *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png) no-repeat;margin-left:-5px}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:54px;width:150px}
  </style>
  <a href=//www.google.com/><span id=logo aria-label=Google></span></a>
  <p><b>404.</b> <ins>That’s an error.</ins>
  <p>The requested URL <code>/api/timedtext?v=r22-7bxKJLw&amp;caps=asr&amp;xoaf=5&amp;hl=en&amp;ip=0.0.0.0&amp;ipbits=0&amp;expire=1674145342&amp;sparams=ip,ipbits,expire,v,caps,xosaf&amp;signature=5565CAD401243008BDD5670AC16FBA8B986F1597.4D1A6C5A32FDF9AE9BF96AFE4584A20D5DA2AFA3&amp;key=yt8&amp;kind=asr&amp;lang=en</code> was not found on this server.  <ins>That’s all we know.</ins>

`

const validXml = `
<?xml version="1.0" encoding="utf-8" ?><transcript><text start="2.639" dur="3.901">here I&amp;#39;ve been one of those women that</text><text start="4.14" dur="3.9">were like I Don&amp;#39;t Need No Man</text><text start="6.54" dur="3">and then you get one and it&amp;#39;s like a</text><text start="8.04" dur="3.9">good one and like does everything for</text><text start="9.54" dur="4.86">you you don&amp;#39;t have to cook dinner</text><text start="11.94" dur="4.14">or get gas you like forget how to do</text><text start="14.4" dur="3.66">everything</text><text start="16.08" dur="4.26"></text><text start="18.06" dur="5.059">hey but like when&amp;#39;s dinner</text><text start="20.34" dur="2.779">it&amp;#39;s almost done</text><text start="24.06" dur="5.58">I hope he never leaves me because I&amp;#39;m</text><text start="27.96" dur="3.6">when a girl is in a relationship with</text><text start="29.64" dur="3.9">you she gets certain benefits you know</text><text start="31.56" dur="3.78">you help her make decisions you take</text><text start="33.54" dur="3.6">responsibility for things there&amp;#39;s</text><text start="35.34" dur="3.6">emotional support there&amp;#39;s advice there&amp;#39;s</text><text start="37.14" dur="3.3">Financial contributions you do her</text><text start="38.94" dur="2.76">favors you know there&amp;#39;s cooking there&amp;#39;s</text><text start="40.44" dur="2.459">helping with the chores whatever it</text><text start="41.7" dur="2.82">might be there&amp;#39;s a lot of benefits to</text><text start="42.899" dur="4.081">being in a relationship with you but</text><text start="44.52" dur="4.74">what happens to those benefits if you</text><text start="46.98" dur="5.04">break up if she has become dependent</text><text start="49.26" dur="4.5">upon you and the benefits that you bring</text><text start="52.02" dur="4.32">her life by being in a relationship with</text><text start="53.76" dur="5.22">you is it really fair to just cut her</text><text start="56.34" dur="5.82">off cold turkey no financial support no</text><text start="58.98" dur="5.88">emotional support is that fair</text><text start="62.16" dur="5.16">yes but what if she has emotional needs</text><text start="64.86" dur="4.079">and she needs somebody to comfort her</text><text start="67.32" dur="3.54">then she needs to reach out to somebody</text><text start="68.939" dur="4.201">else you&amp;#39;re not in a relationship with</text><text start="70.86" dur="4.38">her no longer your concern but but what</text><text start="73.14" dur="4.56">if she can&amp;#39;t afford her rent</text><text start="75.24" dur="4.559">then she needs to get a job her finances</text><text start="77.7" dur="3.779">are no longer your responsibility but</text><text start="79.799" dur="3.481">what about all the things that you used</text><text start="81.479" dur="4.32">to do for her you can&amp;#39;t just leave her</text><text start="83.28" dur="4.92">hanging how is it fair for you to just</text><text start="85.799" dur="4.14">cut her off how is it fair to you to be</text><text start="88.2" dur="3.72">expected to continue to provide</text><text start="89.939" dur="4.141">relational benefits when you&amp;#39;re no</text><text start="91.92" dur="3.78">longer in a relationship all those perks</text><text start="94.08" dur="3.539">that she&amp;#39;s been enjoying that was</text><text start="95.7" dur="3.9">conditional on YouTube being a couple</text><text start="97.619" dur="4.021">you&amp;#39;re a package deal if the</text><text start="99.6" dur="4.8">relationship ends then so do all the</text><text start="101.64" dur="5.1">benefits do not fall for the ***ist myth</text><text start="104.4" dur="4.38">that because you&amp;#39;re a man there are</text><text start="106.74" dur="4.08">somehow different rules that apply and</text><text start="108.78" dur="4.019">she&amp;#39;s just some weak pathetic female who</text><text start="110.82" dur="3.54">can&amp;#39;t possibly take care of herself and</text><text start="112.799" dur="3.061">so even though you&amp;#39;re not dating her</text><text start="114.36" dur="3.78">anymore it&amp;#39;s still your responsibility</text><text start="115.86" dur="4.38">to pay off her credit card no absolutely</text><text start="118.14" dur="5.28">not that those days are over</text><text start="120.24" dur="5.159">chivalry is dead and feminism killed it</text><text start="123.42" dur="3.839">women cannot have it both ways they</text><text start="125.399" dur="4.08">can&amp;#39;t constantly be going on about the</text><text start="127.259" dur="3.78">need for equality and Independence in</text><text start="129.479" dur="3.361">one breath but then in the next breath</text><text start="131.039" dur="3.721">say that it&amp;#39;s a man&amp;#39;s obligation to take</text><text start="132.84" dur="4.14">care of her you&amp;#39;re not even dating her</text><text start="134.76" dur="3.96">anymore and any suggestion that it&amp;#39;s</text><text start="136.98" dur="4.92">your responsibility to continue to</text><text start="138.72" dur="4.98">support her is frankly ***ist like this</text><text start="141.9" dur="3.6">doesn&amp;#39;t go both ways after you break up</text><text start="143.7" dur="3.42">does she come round to your house to</text><text start="145.5" dur="3.54">cook you meals to clean your apartment</text><text start="147.12" dur="4.14">to have *** with you no of course not</text><text start="149.04" dur="4.32">because the relationship is over and she</text><text start="151.26" dur="4.02">understands that when you&amp;#39;re no longer a</text><text start="153.36" dur="3.42">couple all of the benefits that you used</text><text start="155.28" dur="3.959">to get by being in a relationship with</text><text start="156.78" dur="4.679">her are going to dry up why would it be</text><text start="159.239" dur="4.14">any different because you&amp;#39;re a man why</text><text start="161.459" dur="3.721">do so many men keep falling for this and</text><text start="163.379" dur="3.961">how is it that women are able to</text><text start="165.18" dur="3.48">manipulate men into falling for this</text><text start="167.34" dur="3.119">that&amp;#39;s what I&amp;#39;m going to explain in this</text><text start="168.66" dur="3.42">video but first I want to talk about the</text><text start="170.459" dur="3.721">sponsor of today&amp;#39;s video when you first</text><text start="172.08" dur="4.739">hear about steroids it sounds too good</text><text start="174.18" dur="4.38">to be true and it is like you get the</text><text start="176.819" dur="4.14">increased muscle mass but it has all of</text><text start="178.56" dur="4.319">these nasty side effects but luckily</text><text start="180.959" dur="3.78">science does not stop it&amp;#39;s always</text><text start="182.879" dur="3.86">searching for new products new</text><text start="184.739" dur="3.78">substances New Opportunities enter</text><text start="186.739" dur="3.941">turkesterone from Black Forest</text><text start="188.519" dur="4.08">supplements turkestrone is part of a</text><text start="190.68" dur="4.02">group called active steroids these are</text><text start="192.599" dur="4.201">the naturally occurring steroid hormones</text><text start="194.7" dur="4.14">found in plants the good news is that</text><text start="196.8" dur="3.98">unlike synthetic steroids that bind to</text><text start="198.84" dur="4.38">the Androgen receptors in the body</text><text start="200.78" dur="4.599">ectosteroids like tercasteron bind to</text><text start="203.22" dur="3.72">the estrogen receptors which means they</text><text start="205.379" dur="3.301">avoid some of the nasty side effects</text><text start="206.94" dur="3.36">that the androgens can create the</text><text start="208.68" dur="3.059">science is still new but it&amp;#39;s all pretty</text><text start="210.3" dur="2.88">fascinating I&amp;#39;m going to put a link down</text><text start="211.739" dur="3.061">below for anyone who wants to do their</text><text start="213.18" dur="3.059">own research and if you decide this is</text><text start="214.8" dur="2.519">something for you then you should do</text><text start="216.239" dur="2.461">some research you should know what</text><text start="217.319" dur="2.881">you&amp;#39;re putting into your body but if you</text><text start="218.7" dur="3.72">decide that you do want some increased</text><text start="220.2" dur="4.619">energy some muscle growth and you want</text><text start="222.42" dur="4.379">to try to casterone I 100 recommend</text><text start="224.819" dur="4.821">Black Forest supplements they have the</text><text start="226.799" dur="4.86">purest product on the market it is 95</text><text start="229.64" dur="3.94">turkestrone the value for money is</text><text start="231.659" dur="3.181">amazing plus as a member of my audience</text><text start="233.58" dur="2.82">they&amp;#39;re going to give you a five percent</text><text start="234.84" dur="3">discount so click the link in the</text><text start="236.4" dur="3.18">description box below check out their</text><text start="237.84" dur="3.66">website check out all of the positive</text><text start="239.58" dur="3.84">reviews and if you&amp;#39;re ready place your</text><text start="241.5" dur="3.72">order okay back to the video I had a</text><text start="243.42" dur="3.78">couple of hey hero requests recently</text><text start="245.22" dur="3.599">from guys wanting advice about their</text><text start="247.2" dur="3.539">relationships and the things that they</text><text start="248.819" dur="3.721">said to me I found really really</text><text start="250.739" dur="4.2">concerning because it was stuff like</text><text start="252.54" dur="4.199">even though we broke up I continued to</text><text start="254.939" dur="3.781">pay over her rent and her tuition</text><text start="256.739" dur="4.081">because it was the right thing to do it</text><text start="258.72" dur="4.5">was said so casually as though this was</text><text start="260.82" dur="4.62">just assumed there was another guy who</text><text start="263.22" dur="4.199">after the breakup he wanted to do the</text><text start="265.44" dur="3.72">right thing you know she didn&amp;#39;t have</text><text start="267.419" dur="4.5">anywhere to live they&amp;#39;ve been living in</text><text start="269.16" dur="4.979">his apartment rent free I might add she</text><text start="271.919" dur="4.5">didn&amp;#39;t pay a thing you know he covered</text><text start="274.139" dur="4.681">all the mortgage payments whatever but</text><text start="276.419" dur="4.381">he was feeling sorry for her even though</text><text start="278.82" dur="4.14">it was a toxic awful relationship and</text><text start="280.8" dur="4.02">she was abusive he didn&amp;#39;t want her to be</text><text start="282.96" dur="3.66">homeless and so he went to stay with</text><text start="284.82" dur="4.319">friends he had more friends than she did</text><text start="286.62" dur="4.62">no surprise for a couple of weeks so</text><text start="289.139" dur="4.56">that she could take that time to move</text><text start="291.24" dur="4.08">out and to find a new apartment so what</text><text start="293.699" dur="3.301">did she do with that time she caught a</text><text start="295.32" dur="3.84">locksmith locked him out of his own</text><text start="297" dur="3.54">apartment took him months and all these</text><text start="299.16" dur="3.539">legal proceedings to actually get access</text><text start="300.54" dur="4.8">to his own home again why do men fall</text><text start="302.699" dur="4.981">for this the relationship is over your</text><text start="305.34" dur="3.78">obligation is done I mean I know the</text><text start="307.68" dur="4.14">answer I know why men do that it&amp;#39;s</text><text start="309.12" dur="5.34">because they want to be good guys but</text><text start="311.82" dur="4.8">the the days of traditional masculinity</text><text start="314.46" dur="3.6">and being appreciated for the sacrifices</text><text start="316.62" dur="4.079">that we make for women</text><text start="318.06" dur="5.22">it&amp;#39;s over I hate to be the one to burst</text><text start="320.699" dur="4.801">your bubble but those days are done it&amp;#39;s</text><text start="323.28" dur="3.66">over I mean I would prefer things were</text><text start="325.5" dur="3.9">still like that there&amp;#39;s some dignity</text><text start="326.94" dur="4.74">between men and women you know men were</text><text start="329.4" dur="4.079">protectors and providers and women were</text><text start="331.68" dur="3.9">grateful and appreciative of what they</text><text start="333.479" dur="4.801">received but it&amp;#39;s over and it&amp;#39;s time to</text><text start="335.58" dur="5.399">adjust at least on a society-wide level</text><text start="338.28" dur="4.979">that kind of masculinity is no longer</text><text start="340.979" dur="5.701">appreciated it&amp;#39;s just taken advantage of</text><text start="343.259" dur="5.581">so please men be careful with where you</text><text start="346.68" dur="4.739">express your masculinity save it for</text><text start="348.84" dur="4.74">inside relationships find a high quality</text><text start="351.419" dur="3.961">woman who&amp;#39;s feminine who&amp;#39;s submissive</text><text start="353.58" dur="3.899">who appreciates your masculine</text><text start="355.38" dur="3.96">contribution and then give her all of</text><text start="357.479" dur="3.601">your benefits she deserves it because</text><text start="359.34" dur="3.12">she&amp;#39;s in a relationship with you and</text><text start="361.08" dur="2.82">hopefully you&amp;#39;re getting all the</text><text start="362.46" dur="3.78">benefits of being in a relationship with</text><text start="363.9" dur="4.68">her but if that same relationship is</text><text start="366.24" dur="4.019">over she cheats on you she breaks up</text><text start="368.58" dur="2.88">with you you don&amp;#39;t want to be with her</text><text start="370.259" dur="2.88">because you&amp;#39;re not getting any benefit</text><text start="371.46" dur="3.72">from being in a relationship with her</text><text start="373.139" dur="4.021">whatever the circumstances there&amp;#39;s a</text><text start="375.18" dur="4.32">reason why the relationship is done so</text><text start="377.16" dur="3.78">let the relationship ship be done I</text><text start="379.5" dur="3.479">think some guys struggle with this</text><text start="380.94" dur="4.199">because it&amp;#39;s just such a core part of</text><text start="382.979" dur="4.44">their masculine identity that they are</text><text start="385.139" dur="3.921">kind and protective and they want to do</text><text start="387.419" dur="3.961">the right thing by women and they say</text><text start="389.06" dur="4.06">Alexander I can&amp;#39;t be as cold and</text><text start="391.38" dur="4.259">heartless as you&amp;#39;re telling me to be</text><text start="393.12" dur="4.199">because I want to be kind and isn&amp;#39;t it</text><text start="395.639" dur="3.301">the kind thing to do to take care of</text><text start="397.319" dur="3.781">that woman well I counted that with a</text><text start="398.94" dur="4.44">question of my own how is it kind to</text><text start="401.1" dur="4.2">yourself to continue to support a woman</text><text start="403.38" dur="4.14">emotionally and financially who you&amp;#39;re</text><text start="405.3" dur="4.56">not even dating all of that time and</text><text start="407.52" dur="4.5">money that you&amp;#39;re spending on her you</text><text start="409.86" dur="4.08">could be spending on yourself I get it</text><text start="412.02" dur="4.019">you used to be a couple a single unit</text><text start="413.94" dur="4.199">her victories were your victories and it</text><text start="416.039" dur="4.201">made sense to support each other because</text><text start="418.139" dur="4.261">when she wins you wins I get that but</text><text start="420.24" dur="4.14">it&amp;#39;s over now it&amp;#39;s time for her to look</text><text start="422.4" dur="4.32">after herself and for you to look after</text><text start="424.38" dur="4.2">yourself and if you&amp;#39;re falling victim to</text><text start="426.72" dur="3.599">like guilt trips like she&amp;#39;s trying to</text><text start="428.58" dur="4.02">guilt you saying things like why aren&amp;#39;t</text><text start="430.319" dur="4.261">you paying my rent anymore you know I I</text><text start="432.6" dur="4.8">can&amp;#39;t afford the place like this like</text><text start="434.58" dur="4.98">don&amp;#39;t you care about me oh you can</text><text start="437.4" dur="4.44">safely ignore that because she has</text><text start="439.56" dur="4.44">revealed that she doesn&amp;#39;t care about you</text><text start="441.84" dur="4.259">a woman who cares about you and what&amp;#39;s</text><text start="444" dur="4.38">right for you would not be asking for</text><text start="446.099" dur="4.561">free money she would feel guilty about</text><text start="448.38" dur="4.2">taking up your time about taking up your</text><text start="450.66" dur="4.319">emotional resources but if she&amp;#39;s happy</text><text start="452.58" dur="4.32">to still collect on that you know making</text><text start="454.979" dur="3.78">you feel guilty so she can continue the</text><text start="456.9" dur="3.54">benefits then she&amp;#39;s proof she doesn&amp;#39;t</text><text start="458.759" dur="3.78">care about you and why would you spend</text><text start="460.44" dur="3.479">any time doing anything for someone who</text><text start="462.539" dur="3.241">doesn&amp;#39;t care about you I understand</text><text start="463.919" dur="3.541">there are some exceptions to this like</text><text start="465.78" dur="3.9">if the relationship has gone on long</text><text start="467.46" dur="4.32">enough that maybe you have children for</text><text start="469.68" dur="3.9">example that&amp;#39;s like right like I do have</text><text start="471.78" dur="4.319">something of an obligation to the mother</text><text start="473.58" dur="4.619">of my children like I remember a guy on</text><text start="476.099" dur="3.961">hey hero wants to talk to me it was a</text><text start="478.199" dur="3.181">really wealthy guy and you know he&amp;#39;d</text><text start="480.06" dur="3.479">been split up with his partner for 10</text><text start="481.38" dur="3.78">years and he was letting her live in</text><text start="483.539" dur="3.6">this fancy house that he owns completely</text><text start="485.16" dur="3.78">rent free because he wanted his children</text><text start="487.139" dur="3">to live in a nice house in a nice</text><text start="488.94" dur="2.58">neighborhood I don&amp;#39;t have any problem</text><text start="490.139" dur="3.601">with that the guy&amp;#39;s doing something nice</text><text start="491.52" dur="3.959">for his kids and for this woman by</text><text start="493.74" dur="3.72">default by extension that&amp;#39;s his choice</text><text start="495.479" dur="4.081">is money but for guys who aren&amp;#39;t married</text><text start="497.46" dur="4.679">yet who don&amp;#39;t even have children and</text><text start="499.56" dur="4.74">have made no Financial promises no</text><text start="502.139" dur="3.96">obligations to each other I can&amp;#39;t</text><text start="504.3" dur="3.54">understand why you would continue to</text><text start="506.099" dur="3.421">support a woman after the two of you</text><text start="507.84" dur="3.9">have broken up let me break down exactly</text><text start="509.52" dur="4.86">what she&amp;#39;s doing here and why it&amp;#39;s so</text><text start="511.74" dur="5.64">dark what she&amp;#39;s doing is she&amp;#39;s trying to</text><text start="514.38" dur="5.399">Branch swing and then make you complicit</text><text start="517.38" dur="4.56">in that process she wants you to keep up</text><text start="519.779" dur="5.101">the financial support and the emotional</text><text start="521.94" dur="4.8">support until a guy comes along to</text><text start="524.88" dur="3.84">replace you she doesn&amp;#39;t want to let go</text><text start="526.74" dur="4.56">of the benefits that you used to give</text><text start="528.72" dur="4.799">her until she&amp;#39;s got herself a new source</text><text start="531.3" dur="4.62">of benefits but she doesn&amp;#39;t want to give</text><text start="533.519" dur="4.801">you any of the benefits anymore</text><text start="535.92" dur="4.38">I mean maybe once or twice I could have</text><text start="538.32" dur="3.72">some compassion but for any guys who</text><text start="540.3" dur="4.14">continue to fall for this</text><text start="542.04" dur="4.44">you start to lose my sympathy at that</text><text start="544.44" dur="3.899">point you&amp;#39;re complicit even as she&amp;#39;s</text><text start="546.48" dur="3.84">moving further and further away from you</text><text start="548.339" dur="4.44">you just keep holding out that Branch</text><text start="550.32" dur="4.199">further so she can swing a little bit</text><text start="552.779" dur="4.321">easier why are you enabling this</text><text start="554.519" dur="5.401">Behavior what are you doing if it&amp;#39;s some</text><text start="557.1" dur="4.919">desperate weird way for you to pretend</text><text start="559.92" dur="4.8">to yourself that the relationship isn&amp;#39;t</text><text start="562.019" dur="4.621">really over then it&amp;#39;s time to face facts</text><text start="564.72" dur="4.32">you might be thinking to yourself look</text><text start="566.64" dur="4.62">there&amp;#39;s no way that she would be</text><text start="569.04" dur="4.32">accepting all of this emotional support</text><text start="571.26" dur="3.9">I&amp;#39;m giving her she wouldn&amp;#39;t accept all</text><text start="573.36" dur="4.38">these gifts of money that I&amp;#39;m giving her</text><text start="575.16" dur="4.44">unless we still had a connection unless</text><text start="577.74" dur="3.24">you know she still felt something unless</text><text start="579.6" dur="3.54">there was something of a relationship</text><text start="580.98" dur="4.32">still here women certainly couldn&amp;#39;t</text><text start="583.14" dur="4.139">accept all that generosity and then give</text><text start="585.3" dur="3.9">nothing back in return or have any</text><text start="587.279" dur="4.201">intention of reciprocating in the future</text><text start="589.2" dur="4.5">women couldn&amp;#39;t do that uh have you met</text><text start="591.48" dur="4.38">women are you aware of the mental</text><text start="593.7" dur="4.319">gymnastics they&amp;#39;re capable of when it</text><text start="595.86" dur="4.26">comes to backwards rationalizing</text><text start="598.019" dur="4.981">something selfish that benefits them</text><text start="600.12" dur="4.2">women are extraordinary Theory it&amp;#39;s not</text><text start="603" dur="4.92">fair to make that gender that actually</text><text start="604.32" dur="5.639">men can do this to human beings we&amp;#39;re a</text><text start="607.92" dur="4.5">we&amp;#39;re capable of some dark but to</text><text start="609.959" dur="4.261">really drive home just how absurd this</text><text start="612.42" dur="3.96">situation would be just flip the genders</text><text start="614.22" dur="3.78">for a moment all right imagine that</text><text start="616.38" dur="3.72">you&amp;#39;ve broken up with your girlfriend</text><text start="618" dur="4.5">but you say to her that it&amp;#39;s her</text><text start="620.1" dur="4.2">obligation to continue to come around to</text><text start="622.5" dur="3.18">your house to have *** with you sounds</text><text start="624.3" dur="2.94">ridiculous right like she&amp;#39;d be</text><text start="625.68" dur="2.88">completely offended what&amp;#39;s the matter</text><text start="627.24" dur="4.68">with you we&amp;#39;re not in a relationship</text><text start="628.56" dur="5.219">anymore why would I do that okay I&amp;#39;ll</text><text start="631.92" dur="3.72">agree but then why would it make sense</text><text start="633.779" dur="3.541">for you to continue to pay for her</text><text start="635.64" dur="3.66">Netflix account after the relationship</text><text start="637.32" dur="4.62">is over women are capable of being</text><text start="639.3" dur="5.039">completely heartless completely ruthless</text><text start="641.94" dur="4.26">and exploitative women do develop some</text><text start="644.339" dur="3.781">compassion for men that their inside</text><text start="646.2" dur="3.84">relationships with but that evaporates</text><text start="648.12" dur="3.6">really quickly once the relationship is</text><text start="650.04" dur="3.6">done I know that we live in a culture</text><text start="651.72" dur="4.2">that has the myth that man the heartless</text><text start="653.64" dur="4.139">ones that men just go around breaking</text><text start="655.92" dur="4.44">hearts and they can move on so quickly</text><text start="657.779" dur="4.381">and blah blah blah whatever it&amp;#39;s not</text><text start="660.36" dur="3">true there&amp;#39;s data that proves that it&amp;#39;s</text><text start="662.16" dur="3">not true I&amp;#39;ve covered it in videos</text><text start="663.36" dur="3.419">before I&amp;#39;ll put a link down below if you</text><text start="665.16" dur="3.9">don&amp;#39;t believe me for women it could be</text><text start="666.779" dur="4.56">really binary once you lose that</text><text start="669.06" dur="5.1">boyfriend status then you kind of cease</text><text start="671.339" dur="5.581">being special to her and as Unthinkable</text><text start="674.16" dur="4.32">as this might sound to you that you</text><text start="676.92" dur="3.96">can&amp;#39;t possibly comprehend that a woman</text><text start="678.48" dur="4.979">could accept emotional favors and</text><text start="680.88" dur="4.32">monetary gifts from man who she knows</text><text start="683.459" dur="3.481">still has romantic feelings for her</text><text start="685.2" dur="3.84">simply because it benefits her because</text><text start="686.94" dur="4.139">even though she has no intention of</text><text start="689.04" dur="4.799">reciprocating that it absolutely happens</text><text start="691.079" dur="4.44">it&amp;#39;s actually quite common it sucks that</text><text start="693.839" dur="3.421">you&amp;#39;re heartbroken I&amp;#39;m sorry if the</text><text start="695.519" dur="3.301">relationship breakup has been difficult</text><text start="697.26" dur="4.8">on you but you&amp;#39;ve got to accept the</text><text start="698.82" dur="5.88">facts and move on let it be over reclaim</text><text start="702.06" dur="4.5">your dignity make a stand and say no the</text><text start="704.7" dur="3.3">benefits that you got from me were</text><text start="706.56" dur="3.3">conditional on us being in a</text><text start="708" dur="4.32">relationship if we&amp;#39;re not dating anymore</text><text start="709.86" dur="4.5">then it&amp;#39;s done at least then you can go</text><text start="712.32" dur="4.92">and find a new woman with a clean slate</text><text start="714.36" dur="4.5">because I promise you this any new girls</text><text start="717.24" dur="3.24">that you date are not going to be</text><text start="718.86" dur="3.78">excited about the fact that you&amp;#39;re still</text><text start="720.48" dur="3.539">financially supporting your ex would you</text><text start="722.64" dur="2.699">be pleased if you&amp;#39;re dating a girl and</text><text start="724.019" dur="3.121">then found out she was still sleeping</text><text start="725.339" dur="3.361">with her ex-boyfriend it&amp;#39;s up you</text><text start="727.14" dur="3.18">would rightly conclude good that she</text><text start="728.7" dur="3.72">still has feelings for her ex-boyfriend</text><text start="730.32" dur="3.6">and therefore is not ready for a</text><text start="732.42" dur="2.82">relationship with you and she&amp;#39;s going to</text><text start="733.92" dur="2.94">conclude the exact same thing if you&amp;#39;re</text><text start="735.24" dur="3.539">still paying for your ex let me say this</text><text start="736.86" dur="4.8">one more time so that it really sinks in</text><text start="738.779" dur="6.18">once the relationship is over it&amp;#39;s over</text><text start="741.66" dur="4.919">Cut Her Off hey guys hope you enjoyed</text><text start="744.959" dur="4.141">that video if you&amp;#39;re craving more</text><text start="746.579" dur="4.2">Alexander Grace content I gotta say the</text><text start="749.1" dur="3.419">best stuff is hidden behind a paywall</text><text start="750.779" dur="2.761">like if you need advice about your</text><text start="752.519" dur="2.641">individual dating life your</text><text start="753.54" dur="3.359">relationships reach out to me on hey</text><text start="755.16" dur="3.239">hero I create a personalized video just</text><text start="756.899" dur="2.641">for you if you want to test your</text><text start="758.399" dur="2.401">knowledge of this kind of stuff you</text><text start="759.54" dur="3.78">really want to get into depth I</text><text start="760.8" dur="4.2">recommend my paid course 100 sides of</text><text start="763.32" dur="2.94">women fantastic reviews there&amp;#39;s a free</text><text start="765" dur="3.18">trial there&amp;#39;s a video down below that</text><text start="766.26" dur="3.48">explains everything and of course the</text><text start="768.18" dur="3.24">most affordable option is just signing</text><text start="769.74" dur="4.26">up to my patreon it only costs seven</text><text start="771.42" dur="4.38">dollars and you get access to like 270</text><text start="774" dur="3.6">exclusive videos the most recent video</text><text start="775.8" dur="3.06">that I posted two days ago is really</text><text start="777.6" dur="2.76">interesting one it&amp;#39;s about whether or</text><text start="778.86" dur="3.479">not we actually should be trying to</text><text start="780.36" dur="3.779">increase our testosterone or if that&amp;#39;s</text><text start="782.339" dur="3.06">just a caricature of masculinity that&amp;#39;s</text><text start="784.139" dur="3">actually going to do more harm than good</text><text start="785.399" dur="3.301">is there any nuanced topics the sort of</text><text start="787.139" dur="2.88">things that I don&amp;#39;t really cover here on</text><text start="788.7" dur="3.24">the public YouTube channel because not</text><text start="790.019" dur="3.421">algorithm friendly it&amp;#39;s not clickbait</text><text start="791.94" dur="3.42">worthy but it&amp;#39;s really really fantastic</text><text start="793.44" dur="3.36">so if you want to take your knowledge of</text><text start="795.36" dur="4.4">this stuff to the next level I recommend</text><text start="796.8" dur="2.96">any one of those three options</text></transcript>
`

const smallValidXml = `
<note>
<to>Tove</to>
<from>Jani</from>
<heading>Reminder</heading>
<body>Don't forget me this weekend!</body>
</note>
`

const validWithUtf8 = `
<?xml version="1.0" encoding="utf-8" ?>
<transcript>
  <text start="2.639" dur="3.901">I don&amp;#39;t really know</text>
  <text start="32.41" dur="4.829">ないですかねじゃあ確保してないと驚くと</text>
  <text start="32.41" dur="4.829">Here are some symbols $¥/.,""</text>
</transcript>
`

const validKorean = `<?xml version="1.0" encoding="utf-8" ?>
<transcript>
  <text start="0.84" dur="5.3">으 아 hotel</text>
  <text start="14.99" dur="5.129">on</text>
  <text start="17.119" dur="3">oh</text>
  <text start="36.72" dur="8.57">[음악]</text>
  <text start="38.239" dur="23.731">we were</text>
  <text start="45.29" dur="16.68">ho ho ho ho lee</text>
  <text start="67.72" dur="22.32">ho ho ho ho ho ho lee</text>
  <text start="92.939" dur="21.141">ho ho ho ho ho lee</text>
  <text start="112.21" dur="4.449">[음악]</text>
  <text start="114.08" dur="5.579">hot</text>
  <text start="116.659" dur="3">er</text>
  <text start="119.75" dur="19.2">we here we here 2</text>
  <text start="146.599" dur="31.531">here we go here we be a the tower</text>
  <text start="180.319" dur="15.59">ho ho ho ho lee</text>
  <text start="192.909" dur="3">222</text>
  <text start="196.24" dur="3.19">222</text>
  <text start="197.87" dur="8.19">[음악]</text>
  <text start="199.43" dur="6.63">come on</text>
  <text start="206.799" dur="5.311">er</text>
  <text start="209.05" dur="3.06">[음악]</text>
</transcript>`

const correctObject = (o: any): boolean => {
  return 'text' in o && 'start' in o && 'duration' in o && typeof o.start === 'number' && typeof o.duration === 'number' && typeof o.text === 'string'
}

describe(xmlTranscriptionToJson.name, () => {
  it('parses the XML correctly', () => {
    expect(xmlTranscriptionToJson(validXml).every(correctObject)).toBeTruthy()
  })

  it('parses the XML correctly (entries length)', () => {
    const result: TranscriptionEntry[] = xmlTranscriptionToJson(validWithUtf8)
    expect(result.length).toBe(3)
  })

  it('cannot parse a valid XML that has unexpected format', () => {
    expect(() => xmlTranscriptionToJson(smallValidXml)).toThrowError('XML string cannot be converted to transcription entries')
  })

  it('parses apostrophes correctly', () => {
    const result: TranscriptionEntry[] = xmlTranscriptionToJson(validWithUtf8)
    expect(result[0].text).toBe("I don't really know")
  })

  it('parses Japanese correctly', () => {
    const result: TranscriptionEntry[] = xmlTranscriptionToJson(validWithUtf8)
    expect(result[1].text).toBe('ないですかねじゃあ確保してないと驚くと')
  })

  it('parses Korean and number-only fields correctly', () => {
    const result: TranscriptionEntry[] = xmlTranscriptionToJson(validKorean)
    expect(result).toHaveLength(20)
    expect(result[0].text).toBe('으 아 hotel')
    expect(result[14].text).toBe('222')
  })

  it('parses symbols correctly', () => {
    const result: TranscriptionEntry[] = xmlTranscriptionToJson(validWithUtf8)
    expect(result[2].text).toBe('Here are some symbols $¥/.,""')
  })

  it('returns sorted timestamps', () => {
    const res: TranscriptionEntry[] = xmlTranscriptionToJson(validXml)

    for (let i = 0; i < res.length - 1; i++) {
      const curr: TranscriptionEntry = res[i]
      const next: TranscriptionEntry = res[i + 1]

      expect(curr.start).toBeLessThan(next.start)
    }
  })

  it('throws error when the XML is incorrect', () => {
    expect(() => xmlTranscriptionToJson(invalidXml)).toThrowError()
  })
})

describe(validateXml.name, () => {
  it('validates XML correctly', () => {
    expect(() => validateXml(validXml)).toThrowError('XML declaration allowed only at the start of the document.')

    expect(() => validateXml(validXml.trim())).not.toThrowError()
    expect(() => validateXml(smallValidXml.trim())).not.toThrowError()
    expect(() => validateXml(invalidXml.trim())).toThrowError()
  })
})
