import{d,r as l,j as e,R as x}from"./index-D6v0_fcT.js";const o={Wrapper:d.div`
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 20px;
        color: #e6e9f0;
    `,Head:d.div`
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
    `,Title:d.h2`
        margin: 0;
        font-size: 22px;
    `,Sub:d.p`
        margin: 4px 0 0;
        color: #9aa4b2;
        font-size: 14px;
    `,Search:d.input`
        width: 320px;
        max-width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid #222634;
        background: #0b0d12;
        color: #e6e9f0;
        outline: none;
    `,TableWrapper:d.div`
        width: 100%;
        overflow-x: auto;
        border-radius: 14px;
    `,Table:d.table`
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
        a {
            color: #4f8cff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    `,Tags:d.div`
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    `,Tag:d.span`
        font-size: 12px;
        padding: 4px 8px;
        border: 1px solid #222634;
        border-radius: 999px;
        color: #cfd6e6;
        background: #0f1115;
    `},h=[{name:"Projects Index",desc:"Directory of all my projects with search and quick links.",tech:["React","Vite","Styled Components"],live:"https://a2rp.github.io/projects",code:[{label:"Repo",url:"https://github.com/a2rp/projects"}]},{name:"Public Resume (Releases)",desc:"Versioned resume with a permanent download link.",tech:["React","Vite","Styled Components","GitHub Releases"],live:"https://a2rp.github.io/resume/",code:[{label:"Repo",url:"https://github.com/a2rp/resume"}]}],b=()=>{const[n,p]=l.useState(""),i=l.useMemo(()=>{const r=n.trim().toLowerCase();return r?h.filter(t=>((t.name||"")+" "+(t.desc||"")+" "+(Array.isArray(t.tech)?t.tech.join(" "):"")+" "+(Array.isArray(t.code)?t.code.map(s=>s.label).join(" "):"")).toLowerCase().includes(r)):h},[n]),c=l.useMemo(()=>[...i].reverse(),[i]);return e.jsx(e.Fragment,{children:e.jsxs(o.Wrapper,{children:[e.jsxs(o.Head,{children:[e.jsxs("div",{children:[e.jsx(o.Title,{children:"Projects Index"}),e.jsx(o.Sub,{children:"Search by name, description, or tech stack"})]}),e.jsx(o.Search,{value:n,onChange:r=>p(r.target.value),placeholder:"Search projects…"})]}),i.length>0?e.jsx(o.TableWrapper,{children:e.jsxs(o.Table,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:56},children:"#"}),e.jsx("th",{children:"Project Name"}),e.jsx("th",{children:"Project Description"}),e.jsx("th",{children:"Tech Stack"}),e.jsx("th",{children:"Live Link"}),e.jsx("th",{children:"GitHub Code"})]})}),e.jsx("tbody",{children:c.map((r,t)=>e.jsxs("tr",{children:[e.jsx("td",{children:String(c.length-t).padStart(3,"0")}),e.jsx("td",{children:r.name}),e.jsx("td",{children:r.desc}),e.jsx("td",{children:e.jsx(o.Tags,{children:(r.tech||[]).map(a=>e.jsx(o.Tag,{children:a},a))})}),e.jsx("td",{children:r.live?e.jsx("a",{href:r.live,target:"_blank",rel:"noopener noreferrer",children:"Open"}):"—"}),e.jsx("td",{children:(r.code||[]).length?r.code.map((a,s)=>e.jsxs(x.Fragment,{children:[e.jsx("a",{href:a.url,target:"_blank",rel:"noopener noreferrer",children:a.label||"Repo"}),s<r.code.length-1?" · ":""]},a.url)):"—"})]},r.name+t))})]})}):e.jsx("div",{style:{width:"100%",padding:15,textAlign:"center",backgroundColor:"#0f1320",borderRadius:6},children:"No project found"})]})})};export{b as default};
