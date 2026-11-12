(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const icons = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    cube:'<path d="m12 3 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5"/>',
    eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    reset:'<path d="M3 10a9 9 0 1 1 1 7M3 3v7h7"/>',
    pause:'<path d="M8 4v16M16 4v16"/>', play:'<path d="m8 4 12 8-12 8z"/>',
    stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',
    sound:'<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    chat:'<path d="M21 11a9 9 0 0 1-9 9H4l-2 2 1-7a9 9 0 1 1 18-4Z"/>',
    sliders:'<path d="M3 6h5m4 0h9M3 12h11m4 0h3M3 18h3m4 0h11M8 3v6M14 9v6M6 15v6"/>',
    wrench:'<path d="M14 3a6 6 0 0 0-7 7L2 16a3 3 0 0 0 4 4l7-7a6 6 0 0 0 8-7l-5 4-3-3z"/>',
    panel:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 8h10M7 12h6M7 16h3"/>',
    flag:'<path d="M4 22V3c5-4 10 4 16 0v11c-6 4-11-4-16 0"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    plus:'<path d="M12 4v16M4 12h16"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 1 1 4 3c-1 .6-1 1-1 3M12 17h.01"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
    left:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    right:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
    bottom:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 14h18"/>',
    float:'<rect x="3" y="3" width="13" height="12" rx="2"/><rect x="9" y="9" width="12" height="12" rx="2"/>',
    grip:'<path d="M8 5h.01M8 12h.01M8 19h.01M15 5h.01M15 12h.01M15 19h.01" stroke-width="3"/>',
    send:'<path d="m5 12 7-7 7 7M12 5v16"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.panel}</svg>`;
  const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const button = (label, action, glyph, extra = '') => `<button data-action="${action}" ${extra}>${glyph ? icon(glyph) : ''}<span>${label}</span></button>`;
  const state = { mode:'tabs', tab:'tools', selected:'teleport', tools:[], activeDock:{}, draft:'', messages:[], running:true, paused:false, volume:70, score:2, location:'草地起点', inspection:1, weather:'晴天', intensity:1, parameters:{speed:3.5, radius:1.35, distance:5.9, height:2.85, glow:1.7, music:.34}, saved:{}, z:20, toastTimer:0 };
  state.saved = {...state.parameters};
  const newTool = (id, title, kind, glyph) => ({id,title,kind,glyph,open:false,dock:null,x:170,y:95,node:null,feedback:''});
  function toast(message) { const node=$('#toast'); node.textContent=message; node.hidden=false; clearTimeout(state.toastTimer); state.toastTimer=setTimeout(()=>node.hidden=true,2800); }
  function hydrateIcons(scope=document) { scope.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon)); }
  function createTools() { state.tools=[newTool('teleport','传送','teleport','flag'),newTool('inspection','巡检测试','inspection','wrench'),newTool('weather','天气控制','weather','sun')]; state.tools.forEach((tool,index)=>{tool.x=150+index*35;tool.y=105+index*35;tool.node=makeToolNode(tool);}); }
  function toolBody(tool) {
    if(tool.kind==='teleport') return `<p class="tool-description">快速跳到不同测试位置，观察面板操作与反馈。</p><section class="tool-section"><h3>目标位置</h3><label class="field"><span>传送地点</span><select data-field="destination" aria-label="传送地点"><option>草地起点</option><option>中央星星</option><option>树林边缘</option><option>山丘观景点</option></select></label>${button('传送到这里','teleport','flag')}</section><section class="tool-section"><h3>当前位置</h3><div class="readout"><span>位置</span><strong data-readout="location">${state.location}</strong></div><div class="readout"><span>X / Y / Z</span><strong data-readout="position">0.0 / 0.0 / 0.0</strong></div></section>`;
    if(tool.kind==='inspection') return `<p class="tool-description">在当前演示里快速切换任务进度与结束界面。</p><section class="tool-section"><h3>巡检进度</h3><div class="check-list"><label><input type="checkbox" data-inspect="0" checked> 恢复草地照明</label><label><input type="checkbox" data-inspect="1"> 检查星星收集</label><label><input type="checkbox" data-inspect="2"> 完成巡检</label></div><div class="readout"><span>已完成</span><strong data-readout="inspection">1 / 3</strong></div>${button('完成全部巡检','complete-inspection','check')}${button('显示结束界面','show-finish','play')}${button('重新巡检','reset-inspection','reset')}</section><section class="tool-section"><h3>场景状态</h3><div class="readout"><span>演示星星数</span><strong data-readout="score">${state.score} / 5</strong></div><label class="field"><span>星星数量</span><input type="range" min="0" max="5" step="1" value="${state.score}" data-field="score" aria-label="星星数量"></label></section>`;
    if(tool.kind==='weather') return `<p class="tool-description">对比场景的明暗与色调，不改变任务进度。</p><section class="tool-section"><h3>天气与光照</h3><label class="field"><span>天气</span><select data-field="weather" aria-label="天气"><option>晴天</option><option>阴天</option><option>傍晚</option><option>夜晚</option></select></label><label class="field"><span class="field-row"><span>环境亮度</span><output data-output="intensity">1.00</output></span><input type="range" min="0.3" max="1.5" step="0.05" value="1" data-field="intensity" aria-label="环境亮度"></label>${button('恢复默认天气','reset-weather','reset')}</section><section class="tool-section"><h3>当前状态</h3><div class="readout"><span>天气</span><strong data-readout="weather">晴天</strong></div><span class="hint">调节会实时改变示意背景的视觉效果。</span></section>`;
    return `<p class="tool-description">「${escapeHtml(tool.title)}」是你刚创建的本地模拟面板，可以继续体验控件与布局。</p><section class="tool-section"><h3>控制项</h3><label class="field-row toggle-row"><span>启用功能</span><input type="checkbox" role="switch" checked data-field="enabled" aria-label="启用功能"></label><label class="field"><span class="field-row"><span>强度</span><output data-output="custom">50</output></span><input type="range" value="50" min="0" max="100" data-field="custom" aria-label="强度"></label>${button('执行测试','custom-run','play')}</section><div class="readout"><span>运行状态</span><strong data-readout="custom">等待操作</strong></div>`;
  }
  function makeToolNode(tool) {
    const node=document.createElement('section'); node.className='tool-window'; node.dataset.toolId=tool.id; node.setAttribute('aria-label',tool.title);
    node.innerHTML=`<header class="tool-window-header"><div class="drag-handle" tabindex="0" aria-label="拖动${escapeHtml(tool.title)}">${icon('grip')}<strong>${escapeHtml(tool.title)}</strong></div><div class="window-actions"><button class="icon-button" data-window="left" title="停靠到左侧" aria-label="停靠到左侧">${icon('left')}</button><button class="icon-button" data-window="right" title="停靠到右侧" aria-label="停靠到右侧">${icon('right')}</button><button class="icon-button" data-window="bottom" title="停靠到底部" aria-label="停靠到底部">${icon('bottom')}</button><button class="icon-button undock-button" data-window="float" title="恢复悬浮" aria-label="恢复悬浮">${icon('float')}</button><button class="icon-button" data-window="close" title="关闭面板" aria-label="关闭面板">${icon('close')}</button></div></header><div class="tool-body">${toolBody(tool)}<p class="tool-feedback" role="status"></p><p class="demo-note">本地交互示例 · 不会写入真实游戏</p></div>`;
    node.addEventListener('click',event=>{ const action=event.target.closest('[data-window]');if(!action)return;const destination=action.dataset.window;if(destination==='close'){tool.open=false;}else{tool.open=true;tool.dock=destination==='float'?null:destination;if(tool.dock)state.activeDock[tool.dock]=tool.id;else{tool.x=Math.max(65,Math.min(tool.x,innerWidth-720));tool.y=Math.max(65,tool.y);}}renderToolLayout(); });
    node.addEventListener('pointerdown',()=>{if(!tool.dock)node.style.zIndex=String(++state.z);});
    $('.drag-handle',node).addEventListener('pointerdown',event=>startDrag(event,tool));
    $('.drag-handle',node).addEventListener('keydown',event=>{if(event.key==='Escape'&&tool.dock){tool.dock=null;renderToolLayout();}const delta={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[event.key];if(delta&&!tool.dock&&state.mode==='docking'){event.preventDefault();tool.x=Math.max(0,Math.min(innerWidth-340,tool.x+delta[0]));tool.y=Math.max(52,Math.min(innerHeight-100,tool.y+delta[1]));positionFloat(tool);}});
    return node;
  }
  function feedback(tool,text){tool.feedback=text;$('.tool-feedback',tool.node).textContent=text;}
  function setReadout(name,text){document.querySelectorAll(`[data-readout="${name}"]`).forEach(node=>node.textContent=text);}
  function updateScene(){ $('#score').textContent=`${state.score} / 5`;$('#score-progress').style.width=`${state.score*20}%`;setReadout('score',`${state.score} / 5`);$('#pause-overlay').hidden=state.running&&!state.paused;$('#pause-overlay > span:last-of-type').textContent=state.running?'演示已暂停':'预览已停止';const weather={晴天:[1,'none'],阴天:[.7,'saturate(.6)'],傍晚:[.85,'sepia(.4)'],夜晚:[.35,'saturate(.6) hue-rotate(15deg)']}[state.weather];$('.scene-image').style.filter=`brightness(${weather[0]*state.intensity}) ${weather[1]==='none'?'':weather[1]}`;setReadout('weather',state.weather); }
  function positionFloat(tool){tool.node.classList.remove('docked');tool.node.style.left=`${tool.x}px`;tool.node.style.top=`${tool.y}px`;tool.node.style.width='340px';tool.node.style.height='';tool.node.style.zIndex=String(++state.z);tool.node.dataset.docked='false';}
  function renderToolLayout(){
    const parking=$('#panel-parking'),floating=$('#floating-layer');state.tools.forEach(tool=>{parking.append(tool.node);tool.node.hidden=false;});floating.replaceChildren();
    const zones=['left','right','bottom'];zones.forEach(zone=>$('#dock-'+zone).replaceChildren());
    const activeZones={};
    if(state.mode==='tabs'){const selected=state.tools.find(tool=>tool.id===state.selected)||state.tools[0];if(state.tab==='tools'&&$('#tool-mount')&&selected){$('#tool-mount').append(selected.node);selected.node.style.cssText='';selected.node.dataset.docked='sidebar';}}
    else{
      state.tools.filter(tool=>tool.open&&!tool.dock).forEach(tool=>{floating.append(tool.node);positionFloat(tool);});
      zones.forEach(zone=>{const tools=state.tools.filter(tool=>tool.open&&tool.dock===zone);if(!tools.length)return;activeZones[zone]=true;const selected=tools.find(tool=>tool.id===state.activeDock[zone])||tools[0];state.activeDock[zone]=selected.id;const host=$('#dock-'+zone);host.innerHTML=`<div class="dock-tabs" role="tablist" aria-label="${zone==='left'?'左侧':zone==='right'?'右侧':'底部'}停靠工具">${tools.map(tool=>`<button class="${tool===selected?'active':''}" role="tab" aria-selected="${tool===selected}" data-dock-select="${tool.id}">${escapeHtml(tool.title)}</button>`).join('')}</div><div class="dock-content"></div>`;$('.dock-content',host).append(selected.node);selected.node.style.cssText='';selected.node.classList.add('docked');selected.node.dataset.docked=zone;});
    }
    const workspace=$('#workspace');workspace.style.setProperty('--dock-left-width',activeZones.left?'300px':'0px');workspace.style.setProperty('--dock-right-width',activeZones.right?'300px':'0px');workspace.style.setProperty('--dock-bottom-height',activeZones.bottom?'260px':'0px');zones.forEach(zone=>$('#dock-'+zone).hidden=!activeZones[zone]);
    renderTopTools();
  }
  function renderTopTools(){const host=$('#top-tools');host.hidden=state.mode!=='docking';host.innerHTML=state.tools.map(tool=>`<button data-open-tool="${tool.id}" class="${tool.open?'active':''}" title="打开${escapeHtml(tool.title)}">${icon(tool.glyph)}<span>${escapeHtml(tool.title)}</span></button>`).join('');}
  function startDrag(event,tool){
    if(event.button!==0||state.mode!=='docking')return;event.preventDefault();const rect=tool.node.getBoundingClientRect();const offsetX=event.clientX-rect.left,offsetY=event.clientY-rect.top;
    if(tool.dock){tool.dock=null;tool.x=rect.left;tool.y=rect.top;renderToolLayout();}
    const handle=$('.drag-handle',tool.node);handle.setPointerCapture(event.pointerId);tool.node.classList.add('dragging');let destination=null;
    const move=e=>{tool.x=Math.max(0,Math.min(innerWidth-160,e.clientX-offsetX));tool.y=Math.max(48,Math.min(innerHeight-64,e.clientY-offsetY));positionFloat(tool);const scene=$('#scene').getBoundingClientRect();const area=$('#workspace').getBoundingClientRect();const right=$('.right-panel').getBoundingClientRect().left;const left=$('.left-rail').getBoundingClientRect().right;destination=e.clientY<area.top?null:e.clientY>area.bottom-85&&e.clientX>=left&&e.clientX<right?'bottom':e.clientX>=left&&e.clientX<left+90?'left':e.clientX>right-90&&e.clientX<right?'right':null;const hint=$('#dock-preview');hint.hidden=!destination;if(destination){const boxes={left:{left,top:area.top,width:300,height:area.height},right:{left:right-300,top:area.top,width:300,height:area.height},bottom:{left:scene.left,top:area.bottom-260,width:scene.width,height:260}};Object.entries(boxes[destination]).forEach(([key,value])=>hint.style[key]=`${value}px`);$('span',hint).textContent=`松开停靠到${{left:'左侧',right:'右侧',bottom:'底部'}[destination]}`;}};
    const finish=e=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',cancel);tool.node.classList.remove('dragging');$('#dock-preview').hidden=true;if(destination){tool.dock=destination;state.activeDock[destination]=tool.id;}if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);renderToolLayout();};
    const cancel=e=>{destination=null;finish(e);};handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',cancel);
  }
  function renderPlayback(){const controls=`<label class="volume-control" title="演示音量">${icon('sound')}<input aria-label="音量" type="range" min="0" max="100" value="${state.volume}" data-field="volume"></label>${button('停止','stop','stop')}${button(state.paused?'继续':'暂停','pause',state.paused?'play':'pause')}${button('重玩','restart','reset')}`;$('#playback-controls').innerHTML=state.mode==='docking'?`<button class="icon-button" data-action="more" aria-label="更多播放操作" title="更多播放操作">${icon('more')}</button>`:controls;$('#playback-popover').innerHTML=`<strong>播放操作</strong>${controls}<span class="hint">仅演示控件交互</span>`;}
  const parameterGroups=[['玩家',[['speed','移动速度',0,10,.1],['radius','星星拾取半径',.1,3,.05]]],['相机',[['distance','跟随距离',2,12,.1],['height','跟随高度',1,6,.05]]],['草地',[['glow','星星光晕大小',.3,3,.05]]],['音频',[['music','背景音乐音量',0,1,.01]]]];
  function fitRightTabs(){
    const bar=$('.right-tabs');bar.classList.remove('is-compact');
    const buttons=[...bar.children];const gap=parseFloat(getComputedStyle(bar).columnGap)||0;
    const needed=buttons.reduce((sum,button)=>{const style=getComputedStyle(button);const label=button.querySelector('.tab-text');return sum+16+(label?label.scrollWidth+(parseFloat(style.columnGap)||0):0)+(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0);},gap*Math.max(0,buttons.length-1));
    bar.classList.toggle('is-compact',needed>bar.clientWidth-4);
  }
  function renderRightTabs(){
    const entries=[{id:'chat',label:'AI 聊天',glyph:'chat'},...(state.mode==='tabs'?[{id:'parameters',label:'游戏参数',glyph:'sliders'},...state.tools.map(tool=>({id:'tools',toolId:tool.id,label:tool.title,glyph:tool.glyph}))]:[]),{id:'properties',label:'属性',glyph:'panel'}];
    $('.right-tabs').innerHTML=entries.map(entry=>{const active=entry.id===state.tab&&(!entry.toolId||entry.toolId===state.selected);return `<button id="right-tab-${entry.toolId||entry.id}" role="tab" data-tab="${entry.id}" ${entry.toolId?`data-tool-tab="${entry.toolId}"`:''} aria-label="${escapeHtml(entry.label)}" title="${escapeHtml(entry.label)}" aria-controls="right-content" aria-selected="${active}" tabindex="${active?0:-1}" class="${active?'active':''}">${icon(entry.glyph)}<span class="tab-text">${escapeHtml(entry.label)}</span></button>`;}).join('')+(state.mode==='tabs'?`<button class="icon-button" data-action="add-tool" aria-label="添加工具" title="添加工具">${icon('plus')}</button>`:'');
    fitRightTabs();
  }
  function selectRightTab(tab){state.tab=tab.dataset.tab;if(tab.dataset.toolTab)state.selected=tab.dataset.toolTab;renderRight();}
  function renderRight(){
    const wana=$('.wana-header');$('#panel-parking').append(wana);
    renderRightTabs();
    const host=$('#right-content');host.setAttribute('role','tabpanel');host.setAttribute('aria-label',state.tab==='tools'?(state.tools.find(tool=>tool.id===state.selected)?.title||'调试工具'):{chat:'AI 聊天',parameters:'游戏参数',properties:'属性'}[state.tab]);
    if(state.tab==='tools')host.innerHTML='<div id="tool-mount" class="tool-mount"></div>';
    if(state.tab==='chat')host.innerHTML=`<div class="chat-header">工具面板交互演示 <span class="simulation-label">模拟 Agent</span></div><div id="chat-messages" class="chat-messages"><div class="assistant-message"><p>你想加什么工具？</p><p>可以试试「背包测试」「角色状态」「镜头调试」。我会在这个 Demo 中创建一个可操作的示例面板。</p><span class="hint">本地模拟，不连接真实 AI。</span></div>${state.messages.map(message=>`<div class="${message.role==='user'?'user-message':'assistant-message'}">${escapeHtml(message.text)}</div>`).join('')}<div class="chat-suggestions">${['背包测试','角色状态','镜头调试'].map(title=>`<button data-suggestion="${title}">${title} ${icon('plus')}</button>`).join('')}</div></div><form id="chat-form" class="chat-composer"><label for="chat-input" class="sr-only">工具需求</label><textarea id="chat-input" placeholder="输入想创建的工具，例如：添加背包测试面板" rows="3">${escapeHtml(state.draft)}</textarea><div class="composer-bottom"><span class="hint">模拟 Agent · 仅本地交互</span><button type="submit" class="send-button" aria-label="创建示例面板">${icon('send')}</button></div></form>`;
    if(state.tab==='parameters')host.innerHTML=`<div class="panel-actions">${button('调整参数','parameter-help','sliders')}${button('重置','reset-parameters','reset')}</div>${parameterGroups.map(([title,items])=>`<details class="parameter-group" open><summary>${title}</summary>${items.map(([key,label,min,max,step])=>`<label class="field parameter-field"><span class="field-row"><span>${label}</span><output data-param-output="${key}">${state.parameters[key]}</output></span><input type="range" min="${min}" max="${max}" step="${step}" value="${state.parameters[key]}" data-parameter="${key}" aria-label="${label}"></label>`).join('')}</details>`).join('')}<div class="parameter-footer"><p id="parameter-status">${parametersDirty()?'未保存的更改':'参数已保存'}</p><div class="field-row">${button('保存','save-parameters',null,'class="primary-button"')}${button('丢弃','discard-parameters')}</div><p class="hint">仅演示参数编辑与保存状态，不连接真实游戏。</p></div>`;
    if(state.tab==='properties')host.innerHTML=`<h3 class="panel-heading">天空与地面</h3><section class="tool-section"><h3>调色板 <span class="hint">（可编辑）</span></h3><label class="field-row"><span>天空颜色</span><input type="color" value="#79bdf2" aria-label="天空颜色" data-field="sky-color"></label><label class="field-row"><span>地面颜色</span><input type="color" value="#6fbd67" aria-label="地面颜色" data-field="ground-color"></label></section><section class="tool-section"><h3>环境</h3><p class="hint">此 Demo 使用场景示意图。天气控制可以展示亮度变化，属性编辑仅显示本地操作反馈。</p>${button('打开天气控制','open-weather','sun')}</section>`;
    if(state.tab==='chat')$('#chat-messages').prepend(wana);
    renderToolLayout();if(state.tab==='chat')$('#chat-messages').scrollTop=$('#chat-messages').scrollHeight;
  }
  function parametersDirty(){return Object.keys(state.parameters).some(key=>state.parameters[key]!==state.saved[key]);}
  function openTool(id){const tool=state.tools.find(t=>t.id===id);if(!tool)return;state.selected=id;if(state.mode==='tabs'){state.tab='tools';renderRight();}else{tool.open=true;if(tool.dock)state.activeDock[tool.dock]=tool.id;renderToolLayout();}}
  function setMode(mode){state.mode=mode;$('#app').dataset.mode=mode;$('#layout-mode').value=mode;closePopover();if(mode==='docking'){state.tab='chat';if(!state.tools.some(tool=>tool.open)){state.tools[0].open=true;state.tools[0].x=120;state.tools[0].y=100;}}else state.tab='tools';renderPlayback();renderRight();toast(mode==='tabs'?'方案 A：从顶部页签直接切换自定义工具':'方案 B：拖动工具到左侧、右侧或底部停靠');}
  function addCustomPanel(text){text=text.trim();if(!text)return;let title=text.replace(/^(请|帮我|给我|增加|添加|创建|新增|一个|做一个|我要)+/g,'').replace(/(工具|面板)$/g,'').trim().slice(0,12)||'自定义工具';const tool=newTool(`custom-${Date.now()}`,title,'custom','panel');tool.node=makeToolNode(tool);state.tools.push(tool);state.messages.push({role:'user',text},{role:'assistant',text:`已模拟创建「${title}」面板。你可以切换、悬浮或停靠，体验它在编辑器里的位置。`});state.draft='';$('#wana-avatar').src='assets/wana-working.webp';$('#wana-status').textContent='正在创建示例…';renderRight();setTimeout(()=>{openTool(tool.id);$('#wana-avatar').src='assets/wana-complete.webp';$('#wana-status').innerHTML=`${icon('check')}完成`;toast(`已添加「${title}」示例面板`);},450);}
  function closePopover(){$('#playback-popover').hidden=true;$('#popover-backdrop').hidden=true;}
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-tab]');if(tab){selectRightTab(tab);return;}
    const launcher=event.target.closest('[data-open-tool]');if(launcher){openTool(launcher.dataset.openTool);return;}
    const dockTab=event.target.closest('[data-dock-select]');if(dockTab){const tool=state.tools.find(t=>t.id===dockTab.dataset.dockSelect);state.activeDock[tool.dock]=tool.id;renderToolLayout();return;}
    const suggestion=event.target.closest('[data-suggestion]');if(suggestion){addCustomPanel('添加'+suggestion.dataset.suggestion+'面板');return;}
    const trigger=event.target.closest('[data-action]');if(!trigger)return;const action=trigger.dataset.action;const toolNode=trigger.closest('[data-tool-id]');const tool=toolNode&&state.tools.find(t=>t.id===toolNode.dataset.toolId);
    if(action==='help')$('#help-dialog').showModal();
    else if(action==='close-help')$('#help-dialog').close();
    else if(action==='add-tool'){state.tab='chat';renderRight();$('#chat-input').focus();}
    else if(action==='open-tools')openTool(state.selected);
    else if(action==='open-selected')openTool(state.selected);
    else if(action==='open-weather')openTool('weather');
    else if(action==='more'){const box=trigger.getBoundingClientRect();$('#playback-popover').style.left=box.left+'px';$('#playback-popover').style.top=box.bottom+8+'px';$('#playback-popover').hidden=false;$('#popover-backdrop').hidden=false;}
    else if(action==='pause'){state.paused=state.running?!state.paused:false;state.running=true;renderPlayback();updateScene();closePopover();}
    else if(action==='stop'){state.running=false;state.paused=false;updateScene();closePopover();toast('预览已停止（演示状态）');}
    else if(action==='restart'){state.running=true;state.paused=false;state.score=0;updateScene();renderPlayback();closePopover();toast('演示状态已重置');}
    else if(action==='build'||action==='preview'){document.querySelectorAll('.mode-toggle button').forEach(button=>button.classList.toggle('active',button.dataset.action===action));$('#scene-mode-caption').textContent=action==='build'?'构建模式示意 · 面板布局可自由调整':'场景示意 · 拖动面板不会改变游戏内容';toast(action==='build'?'已切到构建模式示意':'已切到预览模式示意');}
    else if(action==='scene-info')toast('这是场景示意背景，重点体验工具面板布局。');
    else if(action==='teleport'){const value=$('[data-field="destination"]',tool.node).value;state.location=value;const locations={'草地起点':[45,64,'0.0 / 0.0 / 0.0'],'中央星星':[64,42,'8.2 / 0.0 / 12.4'],'树林边缘':[22,30,'-12.0 / 0.0 / 9.5'],'山丘观景点':[78,20,'22.0 / 4.0 / 31.0']};const [x,y,position]=locations[value];setReadout('location',value);setReadout('position',position);const marker=$('#scene-marker');marker.hidden=false;marker.style.left=x+'%';marker.style.top=y+'%';$('span:last-child',marker).textContent=value;feedback(tool,`模拟传送至：${value}`);}
    else if(action==='complete-inspection'||action==='reset-inspection'){const complete=action==='complete-inspection';tool.node.querySelectorAll('[data-inspect]').forEach(input=>input.checked=complete);state.inspection=complete?3:0;setReadout('inspection',`${state.inspection} / 3`);feedback(tool,complete?'巡检进度已设为完成':'巡检进度已清零');}
    else if(action==='show-finish'){$('#finish-overlay').hidden=false;feedback(tool,'已展示结束界面示例');}
    else if(action==='close-finish')$('#finish-overlay').hidden=true;
    else if(action==='reset-weather'){state.weather='晴天';state.intensity=1;$('[data-field="weather"]',tool.node).value='晴天';$('[data-field="intensity"]',tool.node).value='1';$('[data-output="intensity"]',tool.node).textContent='1.00';updateScene();feedback(tool,'天气已恢复默认');}
    else if(action==='custom-run'){const enabled=$('[data-field="enabled"]',tool.node).checked;$('[data-readout="custom"]',tool.node).textContent=enabled?'测试已执行':'功能已停用';feedback(tool,enabled?'已执行本地模拟操作':'请先启用功能');}
    else if(action==='save-parameters'){state.saved={...state.parameters};$('#parameter-status').textContent='参数已保存';toast('演示参数已保存');}
    else if(action==='discard-parameters'||action==='reset-parameters'){state.parameters=action==='discard-parameters'?{...state.saved}:{speed:3.5,radius:1.35,distance:5.9,height:2.85,glow:1.7,music:.34};renderRight();}
    else if(action==='parameter-help')toast('拖动滑杆体验参数编辑；此页面不连接真实游戏。');
    else if(action==='reset-demo'){state.mode='tabs';state.tab='tools';state.selected='teleport';state.activeDock={};state.draft='';state.messages=[];state.weather='晴天';state.intensity=1;state.score=2;state.running=true;state.paused=false;state.volume=70;state.location='草地起点';state.inspection=1;state.parameters={speed:3.5,radius:1.35,distance:5.9,height:2.85,glow:1.7,music:.34};state.saved={...state.parameters};state.tools.forEach(t=>t.node.remove());createTools();$('#scene-marker').hidden=true;$('#finish-overlay').hidden=true;setMode('tabs');updateScene();}
  });
  document.addEventListener('input',event=>{const input=event.target;if(input.id==='chat-input'){state.draft=input.value;return;}if(input.dataset.parameter){const key=input.dataset.parameter;state.parameters[key]=Number(input.value);$(`[data-param-output="${key}"]`).textContent=input.value;$('#parameter-status').textContent=parametersDirty()?'未保存的更改':'参数已保存';return;}const field=input.dataset.field;const tool=input.closest('[data-tool-id]');if(field==='volume')state.volume=Number(input.value);if(field==='intensity'){state.intensity=Number(input.value);$('[data-output="intensity"]',tool).textContent=state.intensity.toFixed(2);updateScene();}if(field==='custom')$('[data-output="custom"]',tool).textContent=input.value;if(field==='score'){state.score=Number(input.value);updateScene();}if(input.matches('[data-inspect]')){state.inspection=tool.querySelectorAll('[data-inspect]:checked').length;setReadout('inspection',`${state.inspection} / 3`);}});
  document.addEventListener('change',event=>{const input=event.target;if(input.id==='layout-mode')setMode(input.value);else if(input.dataset.field==='weather'){state.weather=input.value;updateScene();}else if(input.dataset.field?.endsWith('-color'))toast('颜色值已修改（属性控件示例）');});
  document.addEventListener('submit',event=>{if(event.target.id==='chat-form'){event.preventDefault();addCustomPanel(state.draft);}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closePopover();$('#finish-overlay').hidden=true;}const current=event.target.closest('[data-tab]');if(current&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const tabs=[...document.querySelectorAll('[data-tab]')];const next=tabs[(tabs.indexOf(current)+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length];const nextId=next.id;selectRightTab(next);document.getElementById(nextId)?.focus();}});
  $('#popover-backdrop').addEventListener('click',closePopover);window.addEventListener('resize',()=>{state.tools.filter(tool=>tool.open&&!tool.dock).forEach(tool=>{tool.x=Math.min(tool.x,innerWidth-180);tool.y=Math.min(tool.y,innerHeight-100);positionFloat(tool);});});
  hydrateIcons();createTools();renderPlayback();renderRight();updateScene();
  new ResizeObserver(fitRightTabs).observe($('.right-tabs'));
})();
