package main

import (
	"fmt"
	"strings"
	"os"
	"io/ioutil"
	"net/http"
	"log"
	shell "github.com/ipfs/go-ipfs-api"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Hello, world.")
    })

	http.HandleFunc("/post", func(w http.ResponseWriter, r *http.Request) {
		bodyBytes, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Fatal(err)
		}
		bodyString := string(bodyBytes)
		fmt.Fprintln(w, bodyString)
    })

	http.HandleFunc("/ipfs/add", func(w http.ResponseWriter, r *http.Request) {
		bodyBytes, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Fatal(err)
		}
		bodyString := string(bodyBytes)

		// Where your local node is running on localhost:5001
		sh := shell.NewShell("ipfs0:5001")
		cid, err := sh.Add(strings.NewReader(bodyString))
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %s", err)
			os.Exit(1)
		}
		fmt.Printf("added %s", cid)
		fmt.Fprintln(w, cid)
    })

	http.ListenAndServe(":8080", nil)
	
}