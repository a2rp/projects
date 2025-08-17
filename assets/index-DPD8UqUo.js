import{d as o,r as n,j as e,R as x}from"./index-BUZ6uXn1.js";const a={Wrapper:o.div`
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 20px;
        color: #e6e9f0;
    `,Head:o.div`
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
    `,Title:o.h2`
        margin: 0;
        font-size: 22px;
    `,Sub:o.p`
        margin: 4px 0 0;
        color: #9aa4b2;
        font-size: 14px;
    `,Search:o.input`
        width: 320px;
        max-width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid #222634;
        background: #0b0d12;
        color: #e6e9f0;
        outline: none;
    `,TableWrapper:o.div`
        width: 100%;
        overflow-x: auto;
        border-radius: 14px;
    `,Table:o.table`
        width: 100%;
        min-width: 860px;
        border-collapse: separate;
        border-spacing: 0;
        background: #151821;
        border: 1px solid #222634;
        border-radius: 14px;
        overflow: hidden;

        th,
        td {
            padding: 12px 14px;
            text-align: left;
            border-bottom: 1px solid #222634;
            vertical-align: top;
            font-size: 14px;
        }
        thead th {
            background: #0f1320;
            color: #cdd6e3;
            font-weight: 600;
        }
        tbody tr:last-child td {
            border-bottom: 0;
        }
        tbody {
            tr {
                &:hover {
                    background-color: #000;
                }
            }
        }
        a {
            color: #4f8cff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    `,Tags:o.div`
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    `,Tag:o.span`
        font-size: 12px;
        padding: 4px 8px;
        border: 1px solid #222634;
        border-radius: 999px;
        color: #cfd6e6;
        background: #0f1115;
    `},p=[{name:"Projects Index",desc:"Directory of all my projects with search and quick links.",tech:["React","Vite","Styled Components"],live:"https://a2rp.github.io/projects",code:[{label:"Repo",url:"https://github.com/a2rp/projects"}]},{name:"Public Resume (Releases)",desc:"Versioned resume with a permanent download link.",tech:["React","Vite","Styled Components","GitHub Releases"],live:"https://a2rp.github.io/resume/",code:[{label:"Repo",url:"https://github.com/a2rp/resume"}]},{name:"Modal/Drawer Pro",desc:"Accessible modal & drawer with nesting (z-stack), ESC/backdrop close, scroll-lock, localStorage, confirm dialog, and toasts.",tech:["React","Vite","Styled Components","React Toastify"],live:"https://a2rp.github.io/modal-pro/",code:[{label:"Repo",url:"https://github.com/a2rp/modal-pro"}]},{name:"Tooltip Pro",desc:"Dependency-free tooltips & popovers with smart positioning (flip/shift/arrow), hover/focus/click triggers, and accessible ARIA wiring.",tech:["React","Vite","Styled Components"],live:"https://a2rp.github.io/tooltip-pro/",code:[{label:"Repo",url:"https://github.com/a2rp/tooltip-pro"}]},{name:"Tabs Pro",desc:"Accessible tabs with add/close and localStorage persistence (no keyboard shortcuts).",tech:["React","Vite","Styled Components"],live:"https://a2rp.github.io/tabs-pro/",code:[{label:"Repo",url:"https://github.com/a2rp/tabs-pro"}]},{name:"Accordion Pro",desc:"Click-only accordion (no keyboard controls) with localStorage persistence and expand/collapse helpers.",tech:["React","Vite","Styled Components"],live:"https://a2rp.github.io/accordion-pro/",code:[{label:"Repo",url:"https://github.com/a2rp/accordion-pro"}]},{name:"Dropdown/Menu Pro",desc:"Click-only dropdown with one-level submenu, smart placement (flip & clamp), outside-click close. No portals used.",tech:["React","Vite","Styled Components"],live:"https://a2rp.github.io/dropdown-pro/",code:[{label:"Repo",url:"https://github.com/a2rp/dropdown-pro"}]}],u=()=>{const[d,h]=n.useState(""),s=n.useMemo(()=>{const t=d.trim().toLowerCase();return t?p.filter(r=>((r.name||"")+" "+(r.desc||"")+" "+(Array.isArray(r.tech)?r.tech.join(" "):"")+" "+(Array.isArray(r.code)?r.code.map(l=>l.label).join(" "):"")).toLowerCase().includes(t)):p},[d]),c=n.useMemo(()=>[...s].reverse(),[s]);return e.jsx(e.Fragment,{children:e.jsxs(a.Wrapper,{children:[e.jsxs(a.Head,{children:[e.jsxs("div",{children:[e.jsx(a.Title,{children:"Projects Index"}),e.jsx(a.Sub,{children:"Search by name, description, or tech stack"})]}),e.jsx(a.Search,{value:d,onChange:t=>h(t.target.value),placeholder:"Search projects…"})]}),s.length>0?e.jsx(a.TableWrapper,{children:e.jsxs(a.Table,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:56},children:"#"}),e.jsx("th",{children:"Project Name"}),e.jsx("th",{children:"Project Description"}),e.jsx("th",{children:"Tech Stack"}),e.jsx("th",{children:"Live Link"}),e.jsx("th",{children:"GitHub Code"})]})}),e.jsx("tbody",{children:c.map((t,r)=>e.jsxs("tr",{children:[e.jsx("td",{children:String(c.length-r).padStart(3,"0")}),e.jsx("td",{children:t.name}),e.jsx("td",{children:t.desc}),e.jsx("td",{children:e.jsx(a.Tags,{children:(t.tech||[]).map(i=>e.jsx(a.Tag,{children:i},i))})}),e.jsx("td",{children:t.live?e.jsx("a",{href:t.live,target:"_blank",rel:"noopener noreferrer",children:"Open"}):"—"}),e.jsx("td",{children:(t.code||[]).length?t.code.map((i,l)=>e.jsxs(x.Fragment,{children:[e.jsx("a",{href:i.url,target:"_blank",rel:"noopener noreferrer",children:i.label||"Repo"}),l<t.code.length-1?" · ":""]},i.url)):"—"})]},t.name+r))})]})}):e.jsx("div",{style:{width:"100%",padding:15,textAlign:"center",backgroundColor:"#0f1320",borderRadius:6},children:"No project found"})]})})};export{u as default};
