#!/bin/bash -eu

REPOSITORY=http://localhost:5000
JFROG=jfrog.com
END_POINT=$REPOSITORY/v2

repositories=$(curl -sS -X GET $END_POINT/_catalog | jq -r '.repositories[]')
for repo in $repositories
do
    tags=$(curl -sS -X GET $END_POINT/$repo/tags/list | jq -r '.tags[]' )
    for tag in $tags
    do
        echo $REPOSITORY/$repo/$tag to $JFROG/$repo/$tag
        
    done

done


