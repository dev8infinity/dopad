import { DownloadButtonProps } from "./types";
import "../common/css/button.css";
import { mime2extension } from "./mimes";

export default function DownloadButton(props: DownloadButtonProps) {
    return (
        <span className={props.class || "defaultCopyButton"} onClick={async () => {
            fetch(props.url, {
            }).then((response) => {
                if (response.status != 200) {
                    throw new Error("error downloading file");
                }
                return response.blob();
            })
                .then((blob) => {
                    // Create blob link to download
                    const url = window.URL.createObjectURL(
                        new Blob([blob]),
                    );
                    const link = document.createElement('a');
                    link.href = url;

                    link.setAttribute(
                        'download',
                        `${new Date(Date.now() - 86400000).toLocaleDateString('pt-BR').replace(/\//g, '-')}${mime2extension[blob.type] || ""}`,
                    );

                    // Append to html link element page
                    document.body.appendChild(link);

                    // Start download
                    link.click();

                    // Clean up and remove the link
                    link?.parentNode?.removeChild(link);

                }).catch(e => {
                    console.log(e)
                    alert("Ocorreu um erro ao pegar o relatorio gerado, talvez não haja fretes finalizados no dia de ontem")
                });
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
            </svg>
        </span>
    );
} 
