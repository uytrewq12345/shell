#!/bin/bash

# 実行するコマンドリスト
commands=(
    "docker container exec -it gitlab gitlab-rails runner 'puts Sidekiq::Queue.new(\"background_migration\").size'"
    "docker container exec -it gitlab gitlab-rails runner 'puts Sidekiq::ScheduledSet.new.select{ |r| r.klass == \"BackgroundMigrationWorker\"}.size'"
)

# 両方のコマンドが戻り値0になるまで繰り返し実行
function wait_for_success() {
    while true; do
        all_success=true

        for cmd in "${commands[@]}"; do
            # コマンドを実行して出力をキャプチャ
            output=$(eval "$cmd")
            status=$?

            # 出力と戻り値をログに表示
            echo "実行結果: $output (コマンド: $cmd, 戻り値: $status)"

            # 戻り値が0以外の場合は再実行が必要
            if [ $status -ne 0 ] || [ "$output" != "0" ]; then
                all_success=false
            fi
        done

        # 全てのコマンドが成功したら終了
        if $all_success; then
            echo "全てのコマンドが成功しました。スクリプトを終了します。"
            break
        fi

        echo "コマンドのいずれかが失敗または出力が0でないため再試行します..."
        sleep 5 # 再試行まで少し待つ
    done
}

wait_for_success
