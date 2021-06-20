package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	shell "github.com/ipfs/go-ipfs-api"
)

type IpfsData struct {
	CID     string `json:"cid"`
	Content string `json:"content"`
}

type PublishResponse struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello, ipfs api.")
	})

	http.HandleFunc("/post", func(w http.ResponseWriter, r *http.Request) {
		bodyBytes, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Fatal(err)
		}
		bodyString := string(bodyBytes)
		fmt.Printf("post content %s\n", bodyString)
		fmt.Fprintln(w, bodyString)
	})

	http.HandleFunc("/ipfs", func(w http.ResponseWriter, r *http.Request) {
		// Where your local node is running on localhost:5001
		sh := shell.NewShell("ipfs0:5001")
		sh.SetTimeout(1 * time.Second)

		switch r.Method {
		case "PUT":
			url_target := "http://ipfs0:5001/api/v0/name/publish?arg=%2Fipfs%2FQmPATpRyHsRxDkDQtLzpoDKGe3Dt7icWSz2THWjQMt3Xx7&lifetime=100h0m0s&resolve=false&ttl=1m0s"
			args := url.Values{}
			// args.Add("arg", "/ipfs/QmPATpRyHsRxDkDQtLzpoDKGe3Dt7icWSz2THWjQMt3Xx7")
			// args.Add("lifetime", "1m0s")
			// args.Add("resolve", "false")
			// args.Add("ttl", "1m0s")
			res, err := http.PostForm(url_target, args)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Request error: %s", err)
				return
			}
			defer res.Body.Close()

			body, err := ioutil.ReadAll(res.Body)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Request error: %s", err)
				return
			}

			var pubResp PublishResponse
			if err := json.Unmarshal(body, &pubResp); err != nil {
				fmt.Fprintf(os.Stderr, "json error: %s", err)
				return
			}

			fmt.Fprintln(w, pubResp)

		case "POST":
			bodyBytes, err := ioutil.ReadAll(r.Body)
			if err != nil {
				log.Fatal(err)
				return
			}
			bodyString := string(bodyBytes)

			fmt.Println("post content", bodyString)
			// cid, err := sh.Add(strings.NewReader(newStr))
			cid, err := sh.Add(bytes.NewBufferString(bodyString))
			if err != nil {
				fmt.Fprintf(os.Stderr, "error: %s", err)
				return
			}
			fmt.Println("added ", cid)
			fmt.Fprintln(w, cid)
		case "GET":
			var cid = r.FormValue("cid")
			// var cid = "/ipns/k51qzi5uqu5dhd49vps5hzi3a93e1zd31mi0tfd5g6imkk6duc02yyu124vvs3"
			fmt.Println("Cat ", cid)
			reader, err := sh.Cat(cid)
			if err != nil {
				fmt.Fprintf(os.Stderr, "error: %s", err)
				return
			}
			buf := new(bytes.Buffer)
			buf.ReadFrom(reader)
			catContent := buf.String()
			fmt.Println("catContent ", catContent)
			fmt.Fprintln(w, catContent)

		default:
			return
		}

	})

	http.ListenAndServe(":8080", nil)

}
